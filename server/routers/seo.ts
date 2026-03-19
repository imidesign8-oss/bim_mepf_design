import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { seoSettings } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";

export const seoRouter = router({
  // Get SEO settings for a specific page
  getByPageType: adminProcedure
    .input(
      z.object({
        pageType: z.enum(["home", "about", "services", "projects", "blog", "contact", "global"]),
        pageSlug: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const query = input.pageSlug
        ? and(eq(seoSettings.pageType, input.pageType), eq(seoSettings.pageSlug, input.pageSlug))
        : eq(seoSettings.pageType, input.pageType);

      const result = await db.select().from(seoSettings).where(query).limit(1);
      return result.length > 0 ? result[0] : null;
    }),

  // List all SEO settings
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db.select().from(seoSettings).orderBy(seoSettings.pageType);
  }),

  // Create or update SEO settings
  upsert: adminProcedure
    .input(
      z.object({
        pageType: z.enum(["home", "about", "services", "projects", "blog", "contact", "global"]),
        pageSlug: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        ogImage: z.string().optional(),
        ogType: z.string().optional(),
        twitterTitle: z.string().optional(),
        twitterDescription: z.string().optional(),
        twitterImage: z.string().optional(),
        structuredData: z.string().optional(),
        customHeadCode: z.string().optional(),
        customBodyCode: z.string().optional(),
        robotsIndex: z.boolean().optional(),
        robotsFollow: z.boolean().optional(),
        canonicalUrl: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if record exists
      const query = input.pageSlug
        ? and(eq(seoSettings.pageType, input.pageType), eq(seoSettings.pageSlug, input.pageSlug))
        : eq(seoSettings.pageType, input.pageType);

      const existing = await db.select().from(seoSettings).where(query).limit(1);

      if (existing.length > 0) {
        // Update existing record
        await db
          .update(seoSettings)
          .set({
            metaTitle: input.metaTitle,
            metaDescription: input.metaDescription,
            metaKeywords: input.metaKeywords,
            ogTitle: input.ogTitle,
            ogDescription: input.ogDescription,
            ogImage: input.ogImage,
            ogType: input.ogType,
            twitterTitle: input.twitterTitle,
            twitterDescription: input.twitterDescription,
            twitterImage: input.twitterImage,
            structuredData: input.structuredData,
            customHeadCode: input.customHeadCode,
            customBodyCode: input.customBodyCode,
            robotsIndex: input.robotsIndex,
            robotsFollow: input.robotsFollow,
            canonicalUrl: input.canonicalUrl,
            active: input.active,
            updatedAt: new Date(),
          })
          .where(eq(seoSettings.id, existing[0].id));

        return { success: true, id: existing[0].id };
      } else {
        // Create new record
        await db.insert(seoSettings).values({
          pageType: input.pageType,
          pageSlug: input.pageSlug,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
          metaKeywords: input.metaKeywords,
          ogTitle: input.ogTitle,
          ogDescription: input.ogDescription,
          ogImage: input.ogImage,
          ogType: input.ogType,
          twitterTitle: input.twitterTitle,
          twitterDescription: input.twitterDescription,
          twitterImage: input.twitterImage,
          structuredData: input.structuredData,
          customHeadCode: input.customHeadCode,
          customBodyCode: input.customBodyCode,
          robotsIndex: input.robotsIndex ?? true,
          robotsFollow: input.robotsFollow ?? true,
          canonicalUrl: input.canonicalUrl,
          active: input.active ?? true,
        });

        return { success: true }
      }
    }),

  // Delete SEO settings
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(seoSettings).where(eq(seoSettings.id, input.id));
      return { success: true };
    }),

  // Validate JSON code (for structured data and custom code)
  validateCode: adminProcedure
    .input(
      z.object({
        code: z.string(),
        type: z.enum(["json", "html"]),
      })
    )
    .query(({ input }) => {
      try {
        if (input.type === "json") {
          JSON.parse(input.code);
          return { valid: true, error: null };
        } else if (input.type === "html") {
          // Basic HTML validation - check for balanced tags
          const openTags = (input.code.match(/<[^/][^>]*>/g) || []).length;
          const closeTags = (input.code.match(/<\/[^>]*>/g) || []).length;
          if (openTags !== closeTags) {
            return { valid: false, error: "Unbalanced HTML tags" };
          }
          return { valid: true, error: null };
        }
        return { valid: true, error: null };
      } catch (error) {
        return {
          valid: false,
          error: error instanceof Error ? error.message : "Invalid code",
        };
      }
    }),
});
