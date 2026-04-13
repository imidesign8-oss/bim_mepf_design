import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  clientPortalTokens,
  clientProjects,
  tokenUsageAnalytics,
  users,
} from "../../drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import crypto from "crypto";

/**
 * Generate a secure random token
 */
function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export const adminTokenRouter = router({
  /**
   * Generate a new client portal token
   */
  generateToken: adminProcedure
    .input(
      z.object({
        projectId: z.number(),
        tokenName: z.string().min(1, "Token name required"),
        description: z.string().optional(),
        expiresInDays: z.number().optional().default(90),
        ipWhitelist: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verify project exists
        const project = await db
          .select()
          .from(clientProjects)
          .where(eq(clientProjects.id, input.projectId))
          .limit(1);

        if (!project || project.length === 0) {
          throw new Error("Project not found");
        }

        // Generate token
        const token = generateSecureToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

        // Create token record
        const result = await db.insert(clientPortalTokens).values({
          projectId: input.projectId,
          token,
          tokenName: input.tokenName,
          description: input.description,
          expiresAt,
          isActive: true,
          createdByUserId: ctx.user.id,
          ipWhitelist: input.ipWhitelist
            ? JSON.stringify(input.ipWhitelist)
            : null,
        });

        return {
          success: true,
          tokenId: result[0]?.insertId,
          token, // Return full token only on creation
          expiresAt,
          message: "Token generated successfully",
        };
      } catch (error: any) {
        throw new Error(`Failed to generate token: ${error.message}`);
      }
    }),

  /**
   * List all tokens for a project
   */
  listTokens: adminProcedure
    .input(
      z.object({
        projectId: z.number(),
        includeInactive: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input: { projectId, includeInactive } }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const tokens = await db
          .select({
            id: clientPortalTokens.id,
            tokenName: clientPortalTokens.tokenName,
            description: clientPortalTokens.description,
            isActive: clientPortalTokens.isActive,
            expiresAt: clientPortalTokens.expiresAt,
            createdAt: clientPortalTokens.createdAt,
            lastUsedAt: clientPortalTokens.lastUsedAt,
            usageCount: clientPortalTokens.usageCount,
            createdBy: users.name,
          })
          .from(clientPortalTokens)
          .leftJoin(users, eq(clientPortalTokens.createdByUserId, users.id))
          .where(
            includeInactive
              ? eq(clientPortalTokens.projectId, projectId)
              : and(
                  eq(clientPortalTokens.projectId, projectId),
                  eq(clientPortalTokens.isActive, true)
                )
          )
          .orderBy(desc(clientPortalTokens.createdAt));

        return tokens.map((t) => ({
          ...t,
          isExpired: t.expiresAt ? new Date(t.expiresAt) < new Date() : false,
        }));
      } catch (error: any) {
        throw new Error(`Failed to list tokens: ${error.message}`);
      }
    }),

  /**
   * Revoke a token
   */
  revokeToken: adminProcedure
    .input(z.object({ tokenId: z.number() }))
    .mutation(async ({ input: { tokenId } }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db
          .update(clientPortalTokens)
          .set({ isActive: false })
          .where(eq(clientPortalTokens.id, tokenId));

        return { success: true, message: "Token revoked successfully" };
      } catch (error: any) {
        throw new Error(`Failed to revoke token: ${error.message}`);
      }
    }),

  /**
   * Get token usage analytics
   */
  getTokenAnalytics: adminProcedure
    .input(
      z.object({
        tokenId: z.number(),
        daysBack: z.number().optional().default(30),
      })
    )
    .query(async ({ input: { tokenId, daysBack } }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        // Get usage analytics
        const analytics = await db
          .select({
            action: tokenUsageAnalytics.action,
            count: tokenUsageAnalytics.id,
            lastUsed: tokenUsageAnalytics.createdAt,
          })
          .from(tokenUsageAnalytics)
          .where(
            and(
              eq(tokenUsageAnalytics.tokenId, tokenId),
              gte(tokenUsageAnalytics.createdAt, startDate)
            )
          );

        // Group by action
        const actionCounts: Record<string, number> = {};
        analytics.forEach((a) => {
          actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
        });

        // Get token info
        const token = await db
          .select()
          .from(clientPortalTokens)
          .where(eq(clientPortalTokens.id, tokenId))
          .limit(1);

        if (!token || token.length === 0) {
          throw new Error("Token not found");
        }

        const t = token[0];

        return {
          tokenName: t.tokenName,
          totalUsage: analytics.length,
          usageCount: t.usageCount,
          lastUsedAt: t.lastUsedAt,
          actionBreakdown: actionCounts,
          isActive: t.isActive,
          isExpired: t.expiresAt ? new Date(t.expiresAt) < new Date() : false,
        };
      } catch (error: any) {
        throw new Error(`Failed to get analytics: ${error.message}`);
      }
    }),

  /**
   * Get all tokens analytics dashboard
   */
  getDashboardAnalytics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Total tokens
      const allTokens = await db
        .select({ id: clientPortalTokens.id, isActive: clientPortalTokens.isActive })
        .from(clientPortalTokens);

      const activeTokens = allTokens.filter((t) => t.isActive).length;
      const totalTokens = allTokens.length;

      // Total usage
      const usage = await db
        .select()
        .from(tokenUsageAnalytics);

      const totalUsage = usage.length;

      // Most used tokens
      const usageByToken: Record<number, number> = {};
      usage.forEach((u) => {
        usageByToken[u.tokenId] = (usageByToken[u.tokenId] || 0) + 1;
      });

      const mostUsedTokenIds = Object.entries(usageByToken)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => parseInt(id));

      const mostUsedTokens = await db
        .select({
          id: clientPortalTokens.id,
          tokenName: clientPortalTokens.tokenName,
          usageCount: clientPortalTokens.usageCount,
        })
        .from(clientPortalTokens)
        .where(eq(clientPortalTokens.id, mostUsedTokenIds[0]));

      // Expiring soon (within 7 days)
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 7);

      const expiringTokens = await db
        .select({
          id: clientPortalTokens.id,
          tokenName: clientPortalTokens.tokenName,
          expiresAt: clientPortalTokens.expiresAt,
        })
        .from(clientPortalTokens)
        .where(
          and(
            eq(clientPortalTokens.isActive, true),
            lte(clientPortalTokens.expiresAt, expiringDate)
          )
        );

      return {
        totalTokens,
        activeTokens,
        inactiveTokens: totalTokens - activeTokens,
        totalUsage,
        expiringTokensCount: expiringTokens.length,
        expiringTokens: expiringTokens.slice(0, 5),
      };
    } catch (error: any) {
      throw new Error(`Failed to get dashboard analytics: ${error.message}`);
    }
  }),

  /**
   * Update token expiration
   */
  updateTokenExpiration: adminProcedure
    .input(
      z.object({
        tokenId: z.number(),
        expiresInDays: z.number().min(1),
      })
    )
    .mutation(async ({ input: { tokenId, expiresInDays } }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        await db
          .update(clientPortalTokens)
          .set({ expiresAt })
          .where(eq(clientPortalTokens.id, tokenId));

        return {
          success: true,
          expiresAt,
          message: "Token expiration updated",
        };
      } catch (error: any) {
        throw new Error(`Failed to update expiration: ${error.message}`);
      }
    }),

  /**
   * Record token usage
   */
  recordUsage: protectedProcedure
    .input(
      z.object({
        tokenId: z.number(),
        action: z.string(),
        resourceType: z.string().optional(),
        resourceId: z.number().optional(),
        duration: z.number().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input: { tokenId, action, resourceType, resourceId, duration, ipAddress, userAgent } }: any) => {
      const db = await getDb();
      if (!db) return;

      try {
        // Update token last used
        const token = await db
          .select({ usageCount: clientPortalTokens.usageCount })
          .from(clientPortalTokens)
          .where(eq(clientPortalTokens.id, tokenId))
          .limit(1);

        if (token && token.length > 0) {
          await db
            .update(clientPortalTokens)
            .set({
              lastUsedAt: new Date(),
              usageCount: token[0].usageCount + 1,
            })
            .where(eq(clientPortalTokens.id, tokenId));
        }

        // Record usage
        await db.insert(tokenUsageAnalytics).values({
          tokenId,
          sessionId: `session-${Date.now()}`,
          action,
          resourceType,
          resourceId,
          duration,
          ipAddress,
          userAgent,
        });
      } catch (error: any) {
        console.error("Failed to record token usage:", error);
      }
    }),
});
