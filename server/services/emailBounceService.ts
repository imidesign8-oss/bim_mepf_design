import { getDb } from "../db";
import { emailBounces, emailLogs } from "../../drizzle/schema";
import { eq, and, gte } from "drizzle-orm";

export interface EmailBounce {
  id: string;
  email: string;
  bounceType: "permanent" | "temporary" | "complaint";
  reason: string | null;
  bounceCount: number;
  lastBounceAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

class EmailBounceService {
  /**
   * Record an email bounce
   */
  async recordBounce(
    email: string,
    bounceType: "permanent" | "temporary" | "complaint",
    reason?: string
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(emailBounces)
        .where(eq(emailBounces.email, email))
        .limit(1);

      if (existing && existing.length > 0) {
        await db
          .update(emailBounces)
          .set({
            bounceType,
            reason,
            bounceCount: (existing[0].bounceCount || 0) + 1,
            lastBounceAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(emailBounces.email, email));
      } else {
        await db.insert(emailBounces).values({
          id: `bounce-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email,
          bounceType,
          reason,
          bounceCount: 1,
          lastBounceAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Failed to record email bounce:", error);
    }
  }

  /**
   * Check if an email should be suppressed due to bounces
   */
  async shouldSuppressEmail(email: string): Promise<boolean> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const bounce = await db
        .select()
        .from(emailBounces)
        .where(eq(emailBounces.email, email))
        .limit(1);

      if (!bounce || bounce.length === 0) return false;

      const bounceRecord = bounce[0];

      // Suppress if permanent bounce
      if (bounceRecord.bounceType === "permanent") return true;

      // Suppress if too many temporary bounces (3+)
      if (bounceRecord.bounceType === "temporary" && (bounceRecord.bounceCount || 0) >= 3)
        return true;

      // Suppress if complaint
      if (bounceRecord.bounceType === "complaint") return true;

      return false;
    } catch (error) {
      console.error("Failed to check email suppression:", error);
      return false;
    }
  }

  /**
   * Get all bounced emails
   */
  async getBouncedEmails(limit: number = 100, offset: number = 0): Promise<EmailBounce[]> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(emailBounces)
        .orderBy((t) => t.lastBounceAt)
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error("Failed to get bounced emails:", error);
      return [];
    }
  }

  /**
   * Remove an email from bounce list
   */
  async removeBounce(email: string): Promise<void> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(emailBounces).where(eq(emailBounces.email, email));
    } catch (error) {
      console.error("Failed to remove bounce:", error);
    }
  }

  /**
   * Get bounce statistics
   */
  async getBounceStats(): Promise<{
    totalBounces: number;
    permanentBounces: number;
    temporaryBounces: number;
    complaints: number;
    suppressedEmails: number;
  }> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const bounces = await db.select().from(emailBounces);

      return {
        totalBounces: bounces.length,
        permanentBounces: bounces.filter((b) => b.bounceType === "permanent").length,
        temporaryBounces: bounces.filter((b) => b.bounceType === "temporary").length,
        complaints: bounces.filter((b) => b.bounceType === "complaint").length,
        suppressedEmails: bounces.filter((b) => {
          if (b.bounceType === "permanent") return true;
          if (b.bounceType === "temporary" && (b.bounceCount || 0) >= 3) return true;
          if (b.bounceType === "complaint") return true;
          return false;
        }).length,
      };
    } catch (error) {
      console.error("Failed to get bounce stats:", error);
      return {
        totalBounces: 0,
        permanentBounces: 0,
        temporaryBounces: 0,
        complaints: 0,
        suppressedEmails: 0,
      };
    }
  }

  /**
   * Clean up old temporary bounces (older than 30 days with count < 3)
   */
  async cleanupOldBounces(): Promise<void> {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      await db
        .delete(emailBounces)
        .where(
          and(
            eq(emailBounces.bounceType, "temporary"),
            gte(emailBounces.lastBounceAt, thirtyDaysAgo)
          )
        );
    } catch (error) {
      console.error("Failed to cleanup old bounces:", error);
    }
  }
}

export const emailBounceService = new EmailBounceService();
