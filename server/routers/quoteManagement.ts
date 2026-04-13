import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  quoteRequests,
  clientPortalTokens,
  clientProjects,
} from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

/**
 * Generate a secure random token
 */
function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export const quoteManagementRouter = router({
  /**
   * Get all quote requests (admin only)
   */
  listQuotes: adminProcedure
    .input(
      z.object({
        status: z.enum(["generated", "sent", "viewed", "accepted", "rejected", "expired"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input: { status, limit, offset } }: any) => {
      try {
        const db = await getDb();
        if (!db) return [];

        let quotes;
        if (status) {
          quotes = await db
            .select()
            .from(quoteRequests)
            .where(eq(quoteRequests.status, status))
            .orderBy(desc(quoteRequests.createdAt))
            .limit(limit)
            .offset(offset);
        } else {
          quotes = await db
            .select()
            .from(quoteRequests)
            .orderBy(desc(quoteRequests.createdAt))
            .limit(limit)
            .offset(offset);
        }

        return quotes;
      } catch (error: any) {
        console.error("Failed to list quotes:", error);
        return [];
      }
    }),

  /**
   * Get a single quote by ID
   */
  getQuote: adminProcedure
    .input(z.object({ quoteId: z.number() }))
    .query(async ({ input: { quoteId } }: any) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const quote = await db
          .select()
          .from(quoteRequests)
          .where(eq(quoteRequests.id, quoteId))
          .limit(1);

        return quote.length > 0 ? quote[0] : null;
      } catch (error: any) {
        console.error("Failed to get quote:", error);
        return null;
      }
    }),

  /**
   * Update quote status (admin only)
   */
  updateQuoteStatus: adminProcedure
    .input(
      z.object({
        quoteId: z.number(),
        status: z.enum(["generated", "sent", "viewed", "accepted", "rejected", "expired"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input: { quoteId, status, notes } }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: any = {
          status,
          updatedAt: new Date(),
        };

        if (notes) {
          if (status === "rejected") {
            updateData.rejectionReason = notes;
          }
        }

        await db
          .update(quoteRequests)
          .set(updateData)
          .where(eq(quoteRequests.id, quoteId));

        return { success: true, message: "Quote status updated" };
      } catch (error: any) {
        console.error("Failed to update quote status:", error);
        return { success: false, error: error.message };
      }
    }),

  /**
   * Update quote amount (admin can adjust before sending)
   */
  updateQuoteAmount: adminProcedure
    .input(
      z.object({
        quoteId: z.number(),
        quoteAmount: z.number(),
        validityDays: z.number().optional(),
      })
    )
    .mutation(async ({ input: { quoteId, quoteAmount, validityDays } }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: any = {
          quoteAmount,
          updatedAt: new Date(),
        };

        if (validityDays) {
          updateData.quoteValidityDays = validityDays;
          const validUntil = new Date();
          validUntil.setDate(validUntil.getDate() + validityDays);
          updateData.quoteValidUntil = validUntil;
        }

        await db
          .update(quoteRequests)
          .set(updateData)
          .where(eq(quoteRequests.id, quoteId));

        return { success: true, message: "Quote amount updated" };
      } catch (error: any) {
        console.error("Failed to update quote amount:", error);
        return { success: false, error: error.message };
      }
    }),

  /**
   * Approve quote and generate access token for client
   */
  approveAndGenerateToken: adminProcedure
    .input(
      z.object({
        quoteId: z.number(),
        clientEmail: z.string().email(),
        projectName: z.string(),
        expiresInDays: z.number().default(90),
      })
    )
    .mutation(async ({ input: { quoteId, clientEmail, projectName, expiresInDays }, ctx }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Update quote status to sent (approved state)
        await db
          .update(quoteRequests)
          .set({
            status: "sent",
            sentDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(quoteRequests.id, quoteId));

        // Generate secure token
        const token = generateSecureToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        // Create client project if not exists
        // For now, we'll skip project creation and just use the quote ID
        // In a full implementation, you'd create a proper client first
        // const projectResult = await db.insert(clientProjects).values({
        //   projectCode: `QUOTE-${quoteId}`,
        //   projectName,
        //   clientId: 1, // Would need to look up or create client
        //   projectType: "commercial",
        //   status: "active",
        //   portalAccessEnabled: true,
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        // });
        // const projectId = projectResult[0]?.insertId;

        // Use quote ID as project reference for now
        const projectId = quoteId;

        // Create portal token - use ctx.user.id if available, otherwise use 1 as default
        const userId = ctx?.user?.id || 1;
        const tokenResult = await db.insert(clientPortalTokens).values({
          token,
          projectId: projectId || quoteId,
          tokenName: `Quote ${quoteId} - ${clientEmail}`,
          expiresAt,
          isActive: true,
          createdByUserId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          success: true,
          message: "Quote approved and token generated",
          token,
          projectId,
          expiresAt: expiresAt.toISOString(),
          clientEmail,
          projectName,
        };
      } catch (error: any) {
        console.error("Failed to approve quote and generate token:", error);
        return { success: false, error: error.message };
      }
    }),

  /**
   * Get quote statistics
   */
  getStatistics: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return null;

      const allQuotes = await db.select().from(quoteRequests);

        const stats = {
          total: allQuotes.length,
          generated: allQuotes.filter((q) => q.status === "generated").length,
          sent: allQuotes.filter((q) => q.status === "sent").length,
          viewed: allQuotes.filter((q) => q.status === "viewed").length,
          accepted: allQuotes.filter((q) => q.status === "accepted").length,
          rejected: allQuotes.filter((q) => q.status === "rejected").length,
          totalValue: allQuotes.reduce((sum, q) => sum + (parseFloat(q.quoteAmount as any) || 0), 0),
          averageValue: allQuotes.length > 0 
            ? allQuotes.reduce((sum, q) => sum + (parseFloat(q.quoteAmount as any) || 0), 0) / allQuotes.length 
            : 0,
        };

      return stats;
    } catch (error: any) {
      console.error("Failed to get quote statistics:", error);
      return null;
    }
  }),

  /**
   * Reject quote with reason
   */
  rejectQuote: adminProcedure
    .input(
      z.object({
        quoteId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input: { quoteId, reason } }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(quoteRequests)
          .set({
            status: "rejected",
            rejectionReason: reason,
            rejectedDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(quoteRequests.id, quoteId));

        return { success: true, message: "Quote rejected" };
      } catch (error: any) {
        console.error("Failed to reject quote:", error);
        return { success: false, error: error.message };
      }
    }),

  /**
   * Mark quote as sent
   */
  markAsSent: adminProcedure
    .input(z.object({ quoteId: z.number() }))
    .mutation(async ({ input: { quoteId } }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(quoteRequests)
          .set({
            status: "sent",
            sentDate: new Date(),
            emailsSent: 1,
            lastEmailSentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(quoteRequests.id, quoteId));

        return { success: true, message: "Quote marked as sent" };
      } catch (error: any) {
        console.error("Failed to mark quote as sent:", error);
        return { success: false, error: error.message };
      }
    }),
});
