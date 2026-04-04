/**
 * Advanced Email Marketing Router
 * Handles webhooks, segmentation, and template builder
 */

import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as webhookService from '../services/webhookService';
import * as segmentationService from '../services/segmentationService';
import * as templateBuilderService from '../services/templateBuilderService';

export const advancedEmailMarketing = router({
  // Webhook endpoints
  webhooks: {
    processGmailWebhook: publicProcedure
      .input(z.any())
      .mutation(async ({ input }: any) => {
        const result = await webhookService.processGmailWebhook(input);
        return { success: result };
      }),

    processSendGridWebhook: publicProcedure
      .input(z.any())
      .mutation(async ({ input }: any) => {
        const result = await webhookService.processSendGridWebhook(input);
        return { success: result };
      }),

    getStats: protectedProcedure.query(async () => {
      return await webhookService.getWebhookStats();
    }),
  },

  // Recipient segmentation
  segments: {
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          criteria: z.object({
            recipientType: z.enum(['architect', 'builder', 'engineer', 'other']).optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            status: z.enum(['subscribed', 'unsubscribed', 'bounced']).optional(),
            tags: z.array(z.string()).optional(),
            createdAfter: z.date().optional(),
            createdBefore: z.date().optional(),
          }),
        })
      )
      .mutation(async ({ input }: any) => {
        return await segmentationService.createSegment(input.name, input.description || '', input.criteria);
      }),

    getAll: protectedProcedure.query(async () => {
      return await segmentationService.getAllSegments();
    }),

    getById: protectedProcedure
      .input(z.object({ segmentId: z.number() }))
      .query(async ({ input }: any) => {
        return await segmentationService.getSegmentById(input.segmentId);
      }),

    getRecipients: protectedProcedure
      .input(z.object({ segmentId: z.number() }))
      .query(async ({ input }: any) => {
        return await segmentationService.getSegmentRecipients(input.segmentId);
      }),

    getRecipientCount: protectedProcedure
      .input(z.object({ segmentId: z.number() }))
      .query(async ({ input }: any) => {
        return await segmentationService.getSegmentRecipientCount(input.segmentId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          segmentId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          criteria: z.object({
            recipientType: z.enum(['architect', 'builder', 'engineer', 'other']).optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            status: z.enum(['subscribed', 'unsubscribed', 'bounced']).optional(),
            tags: z.array(z.string()).optional(),
            createdAfter: z.date().optional(),
            createdBefore: z.date().optional(),
          }),
        })
      )
      .mutation(async ({ input }: any) => {
        return await segmentationService.updateSegment(
          input.segmentId,
          input.name,
          input.description || '',
          input.criteria
        );
      }),

    delete: protectedProcedure
      .input(z.object({ segmentId: z.number() }))
      .mutation(async ({ input }: any) => {
        return await segmentationService.deleteSegment(input.segmentId);
      }),

    getStats: protectedProcedure.query(async () => {
      return await segmentationService.getSegmentStats();
    }),
  },

  // Email template builder
  templates: {
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          subject: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }: any) => {
        return await templateBuilderService.createTemplate(input.name, input.subject, input.description);
      }),

    getAll: protectedProcedure.query(async () => {
      return await templateBuilderService.getAllTemplates();
    }),

    getById: protectedProcedure
      .input(z.object({ templateId: z.number() }))
      .query(async ({ input }: any) => {
        return await templateBuilderService.getTemplateById(input.templateId);
      }),

    updateBlocks: protectedProcedure
      .input(
        z.object({
          templateId: z.number(),
          blocks: z.array(
            z.object({
              id: z.string(),
              type: z.enum(['text', 'image', 'button', 'divider', 'spacer', 'heading', 'paragraph']),
              content: z.any(),
              order: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input }: any) => {
        return await templateBuilderService.updateTemplateBlocks(input.templateId, input.blocks);
      }),

    addBlock: protectedProcedure
      .input(
        z.object({
          templateId: z.number(),
          block: z.object({
            id: z.string(),
            type: z.enum(['text', 'image', 'button', 'divider', 'spacer', 'heading', 'paragraph']),
            content: z.any(),
            order: z.number(),
          }),
        })
      )
      .mutation(async ({ input }: any) => {
        return await templateBuilderService.addBlockToTemplate(input.templateId, input.block);
      }),

    updateBlock: protectedProcedure
      .input(
        z.object({
          templateId: z.number(),
          blockId: z.string(),
          block: z.object({
            id: z.string().optional(),
            type: z.enum(['text', 'image', 'button', 'divider', 'spacer', 'heading', 'paragraph']).optional(),
            content: z.any().optional(),
            order: z.number().optional(),
          }),
        })
      )
      .mutation(async ({ input }: any) => {
        return await templateBuilderService.updateBlockInTemplate(input.templateId, input.blockId, input.block);
      }),

    removeBlock: protectedProcedure
      .input(z.object({ templateId: z.number(), blockId: z.string() }))
      .mutation(async ({ input }: any) => {
        return await templateBuilderService.removeBlockFromTemplate(input.templateId, input.blockId);
      }),

    reorderBlocks: protectedProcedure
      .input(z.object({ templateId: z.number(), blockIds: z.array(z.string()) }))
      .mutation(async ({ input }: any) => {
        return await templateBuilderService.reorderBlocksInTemplate(input.templateId, input.blockIds);
      }),

    updateMetadata: protectedProcedure
      .input(
        z.object({
          templateId: z.number(),
          name: z.string().optional(),
          subject: z.string().optional(),
          description: z.string().optional(),
          backgroundColor: z.string().optional(),
          fontFamily: z.string().optional(),
          isDefault: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }: any) => {
        const { templateId, ...updates } = input;
        return await templateBuilderService.updateTemplateMetadata(templateId, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ templateId: z.number() }))
      .mutation(async ({ input }: any) => {
        return await templateBuilderService.deleteTemplate(input.templateId);
      }),

    renderToHtml: protectedProcedure
      .input(z.object({ templateId: z.number(), logoUrl: z.string().optional() }))
      .query(async ({ input }: any) => {
        return await templateBuilderService.renderTemplateToHtml(input.templateId, input.logoUrl);
      }),
  },
});
