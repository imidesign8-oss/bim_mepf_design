import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { pageMetadata } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const pageMetadataRouter = router({
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;
        const result = await (db as any).query.pageMetadata.findFirst({
          where: eq(pageMetadata.pageSlug, input.slug),
        });
        return result || null;
      } catch (error) {
        console.error("[PAGE_METADATA] Error fetching metadata:", error);
        return null;
      }
    }),

  getAll: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return [];
      return await (db as any).query.pageMetadata.findMany();
    } catch (error) {
      console.error("[PAGE_METADATA] Error fetching all metadata:", error);
      return [];
    }
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        pageSlug: z.string(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        ogImage: z.string().optional(),
        ogImageAlt: z.string().optional(),
        twitterCard: z.string().optional(),
        twitterImage: z.string().optional(),
        canonicalUrl: z.string().optional(),
        keywords: z.string().optional(),
        robots: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can manage page metadata",
        });
      }

      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const existing = await (db as any).query.pageMetadata.findFirst({
          where: eq(pageMetadata.pageSlug, input.pageSlug),
        });

        if (existing) {
          const { pageSlug, ...updateData } = input;
          await (db as any)
            .update(pageMetadata)
            .set({
              ...updateData,
              updatedAt: new Date(),
            })
            .where(eq(pageMetadata.pageSlug, input.pageSlug));

          return { success: true, action: "updated" };
        } else {
          await (db as any).insert(pageMetadata).values({
            pageSlug: input.pageSlug,
            metaTitle: input.metaTitle,
            metaDescription: input.metaDescription,
            ogTitle: input.ogTitle,
            ogDescription: input.ogDescription,
            ogImage: input.ogImage,
            ogImageAlt: input.ogImageAlt,
            twitterCard: input.twitterCard,
            twitterImage: input.twitterImage,
            canonicalUrl: input.canonicalUrl,
            keywords: input.keywords,
            robots: input.robots,
          });

          return { success: true, action: "created" };
        }
      } catch (error) {
        console.error("[PAGE_METADATA] Error upserting metadata:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save page metadata",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete page metadata",
        });
      }

      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await (db as any)
          .delete(pageMetadata)
          .where(eq(pageMetadata.pageSlug, input.slug));

        return { success: true };
      } catch (error) {
        console.error("[PAGE_METADATA] Error deleting metadata:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete page metadata",
        });
      }
    }),

  getStats: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return { total: 0, withOgImage: 0, withMetaDesc: 0, coverage: {} };
      
      const all = await (db as any).query.pageMetadata.findMany();
      const withOgImage = all.filter((p: any) => p.ogImage).length;
      const withMetaDesc = all.filter((p: any) => p.metaDescription).length;

      return {
        total: all.length,
        withOgImage,
        withMetaDesc,
        coverage: {
          ogImage: all.length > 0 ? Math.round((withOgImage / all.length) * 100) : 0,
          metaDescription: all.length > 0 ? Math.round((withMetaDesc / all.length) * 100) : 0,
        },
      };
    } catch (error) {
      console.error("[PAGE_METADATA] Error fetching stats:", error);
      return { total: 0, withOgImage: 0, withMetaDesc: 0, coverage: {} };
    }
  }),
});
