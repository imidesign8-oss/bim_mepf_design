import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import {
  emailCampaigns,
  emailRecipients,
  campaignRecipients,
  InsertEmailCampaign,
  InsertEmailRecipient,
  InsertCampaignRecipient,
} from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { sendBulkEmailCampaign, getCampaignStats, parseEmailCSV } from '../services/bulkEmailService';
import { getTemplate, getTemplateList } from '../services/emailMarketingTemplates';

function ensureAdmin(ctx: any) {
  if (ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
}

export const emailMarketingRouter = router({
  // Get email templates list
  templates: {
    list: publicProcedure.query(() => {
      return getTemplateList();
    }),

    get: publicProcedure
      .input(z.object({ templateType: z.enum(['architect', 'builder', 'custom']) }))
      .query(({ input }) => {
        return getTemplate(input.templateType as any);
      }),
  },

  // Email recipients management
  recipients: {
    // Upload recipients from CSV
    upload: protectedProcedure
      .input(z.object({
        csvContent: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);

        try {
          const db = await getDb();
          if (!db) throw new Error('Database not available');

          const recipients = parseEmailCSV(input.csvContent);
          let insertedCount = 0;
          let skippedCount = 0;

          for (const recipient of recipients) {
            try {
              // Check if email already exists
              const existing = await db
                .select()
                .from(emailRecipients)
                .where(eq(emailRecipients.email, recipient.email)) as any;

              if (!existing || existing.length === 0) {
                await db.insert(emailRecipients).values({
                  email: recipient.email,
                  name: recipient.name,
                  recipientType: recipient.recipientType,
                  company: recipient.company,
                  city: recipient.city,
                  state: recipient.state,
                  subscribed: true,
                });
                insertedCount++;
              } else {
                skippedCount++;
              }
            } catch (error) {
              console.error(`Failed to insert recipient ${recipient.email}:`, error);
              skippedCount++;
            }
          }

          return {
            success: true,
            insertedCount,
            skippedCount,
            totalProcessed: recipients.length,
            message: `Uploaded ${insertedCount} new recipients, ${skippedCount} already existed`,
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'Failed to upload recipients',
          });
        }
      }),

    // Get all recipients
    list: protectedProcedure
      .input(z.object({
        recipientType: z.enum(['architect', 'builder', 'other', 'all']).optional(),
        subscribed: z.boolean().optional(),
      }))
      .query(async ({ input, ctx }) => {
        ensureAdmin(ctx);

        try {
          const db = await getDb();
          if (!db) throw new Error('Database not available');

          let query = db.select().from(emailRecipients) as any;

          if (input.recipientType && input.recipientType !== 'all') {
            query = query.where(eq(emailRecipients.recipientType, input.recipientType));
          }

          if (input.subscribed !== undefined) {
            query = query.where(eq(emailRecipients.subscribed, input.subscribed));
          }

          return await query;
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch recipients',
          });
        }
      }),

    // Delete recipient
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);

        try {
          const db = await getDb();
          if (!db) throw new Error('Database not available');

          await db.delete(emailRecipients).where(eq(emailRecipients.id, input.id));

          return { success: true, message: 'Recipient deleted' };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete recipient',
          });
        }
      }),
  },

  // Email campaigns
  campaigns: {
    // Create campaign
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        subject: z.string().min(1),
        content: z.string().min(1),
        templateType: z.enum(['architect', 'builder', 'custom']),
        recipientIds: z.array(z.number()),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);

        try {
          const db = await getDb();
          if (!db) throw new Error('Database not available');

          // Create campaign
          const campaign = await db.insert(emailCampaigns).values({
            name: input.name,
            subject: input.subject,
            content: input.content,
            templateType: input.templateType,
            status: 'draft',
            totalRecipients: input.recipientIds.length,
          });

          const campaignId = (campaign as any)[0];

          // Add recipients to campaign
          for (const recipientId of input.recipientIds) {
            const recipient = await db
              .select()
              .from(emailRecipients)
              .where(eq(emailRecipients.id, recipientId));

            if (recipient.length > 0) {
              await db.insert(campaignRecipients).values({
                campaignId,
                recipientId,
                email: recipient[0].email,
                status: 'pending',
              });
            }
          }

          return {
            success: true,
            campaignId,
            message: 'Campaign created successfully',
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'Failed to create campaign',
          });
        }
      }),

    // Get all campaigns
    list: protectedProcedure.query(async ({ ctx }) => {
      ensureAdmin(ctx);

      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        return db.select().from(emailCampaigns);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch campaigns',
        });
      }
    }),

    // Get campaign details
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        ensureAdmin(ctx);

        try {
          const db = await getDb();
          if (!db) throw new Error('Database not available');

          const campaign = await db
            .select()
            .from(emailCampaigns)
            .where(eq(emailCampaigns.id, input.id));

          if (campaign.length === 0) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
          }

          const stats = await getCampaignStats(input.id);

          return {
            ...campaign[0],
            stats,
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch campaign',
          });
        }
      }),

    // Send campaign
    send: protectedProcedure
      .input(z.object({
        campaignId: z.number(),
        fromEmail: z.string().email(),
        fromName: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);

        try {
          const db = await getDb();
          if (!db) throw new Error('Database not available');

          // Get campaign
          const campaign = await db
            .select()
            .from(emailCampaigns)
            .where(eq(emailCampaigns.id, input.campaignId));

          if (campaign.length === 0) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
          }

          // Get recipients
          const recipients = await db
            .select()
            .from(campaignRecipients)
            .where(eq(campaignRecipients.campaignId, input.campaignId));

          const recipientData = recipients.map(r => ({
            id: r.recipientId,
            email: r.email,
          }));

          // Send campaign
          const result = await sendBulkEmailCampaign({
            campaignId: input.campaignId,
            subject: campaign[0].subject,
            content: campaign[0].content,
            recipients: recipientData,
            fromEmail: input.fromEmail,
            fromName: input.fromName,
          });

          // Update campaign status
          await db
            .update(emailCampaigns)
            .set({
              status: 'sending',
              startedAt: new Date(),
            })
            .where(eq(emailCampaigns.id, input.campaignId));

          return result;
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'Failed to send campaign',
          });
        }
      }),

    // Delete campaign
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);

        try {
          const db = await getDb();
          if (!db) throw new Error('Database not available');

          await db.delete(emailCampaigns).where(eq(emailCampaigns.id, input.id));

          return { success: true, message: 'Campaign deleted' };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete campaign',
          });
        }
      }),
  },
});
