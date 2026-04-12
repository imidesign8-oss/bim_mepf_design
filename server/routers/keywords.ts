import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as keywordService from "../services/keywordService";

export const keywordsRouter = router({
  /**
   * Add a new target keyword
   */
  addKeyword: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(
      z.object({
        keyword: z.string().min(1),
        category: z.string().optional(),
        searchVolume: z.number().optional(),
        difficulty: z.number().min(0).max(100).optional(),
        targetPosition: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      return keywordService.addKeyword(input);
    }),

  /**
   * Get all keywords or filter by category
   */
  getKeywords: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(
      z.object({
        category: z.string().optional(),
      })
    )
    .query(async ({ input }: { input: any }) => {
      return keywordService.getKeywords(input.category);
    }),

  /**
   * Get keyword by ID
   */
  getKeywordById: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(z.object({ id: z.number() }))
    .query(async ({ input }: { input: any }) => {
      const result = await keywordService.getKeywordById(input.id);
      return result[0] || null;
    }),

  /**
   * Update keyword
   */
  updateKeyword: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(
      z.object({
        id: z.number(),
        keyword: z.string().optional(),
        category: z.string().optional(),
        searchVolume: z.number().optional(),
        difficulty: z.number().min(0).max(100).optional(),
        currentPosition: z.number().optional(),
        targetPosition: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      const { id, ...data } = input;
      return keywordService.updateKeyword(id, data);
    }),

  /**
   * Delete keyword
   */
  deleteKeyword: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: { input: any }) => {
      return keywordService.deleteKeyword(input.id);
    }),

  /**
   * Analyze keyword density on a page
   */
  analyzeKeywordDensity: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(
      z.object({
        pagePath: z.string(),
        content: z.string(),
        keywords: z.array(z.string()),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      return keywordService.analyzeKeywordDensity(
        input.pagePath,
        input.content,
        input.keywords
      );
    }),

  /**
   * Get keyword density analysis for a page
   */
  getKeywordDensityForPage: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(z.object({ pagePath: z.string() }))
    .query(async ({ input }: { input: any }) => {
      return keywordService.getKeywordDensityForPage(input.pagePath);
    }),

  /**
   * Add internal link
   */
  addInternalLink: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(
      z.object({
        sourcePagePath: z.string(),
        targetPagePath: z.string(),
        anchorText: z.string(),
        linkType: z.enum(["contextual", "related", "navigation", "footer"]),
        keywordTarget: z.string().optional(),
        position: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      return keywordService.addInternalLink(input);
    }),

  /**
   * Get internal links from a page
   */
  getInternalLinksFromPage: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(z.object({ sourcePagePath: z.string() }))
    .query(async ({ input }: { input: any }) => {
      return keywordService.getInternalLinksFromPage(input.sourcePagePath);
    }),

  /**
   * Get internal links to a page
   */
  getInternalLinksToPage: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(z.object({ targetPagePath: z.string() }))
    .query(async ({ input }: { input: any }) => {
      return keywordService.getInternalLinksToPage(input.targetPagePath);
    }),

  /**
   * Get all internal links
   */
  getAllInternalLinks: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    }).query(async () => {
    return keywordService.getAllInternalLinks();
  }),

  /**
   * Update internal link
   */
  updateInternalLink: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(
      z.object({
        id: z.number(),
        anchorText: z.string().optional(),
        keywordTarget: z.string().optional(),
        position: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      const { id, ...data } = input;
      return keywordService.updateInternalLink(id, data);
    }),

  /**
   * Delete internal link
   */
  deleteInternalLink: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: { input: any }) => {
      return keywordService.deleteInternalLink(input.id);
    }),

  /**
   * Audit internal linking strategy
   */
  auditInternalLinks: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    }).query(async () => {
    return keywordService.auditInternalLinks();
  }),

  /**
   * Get linking recommendations
   */
  getLinkingRecommendations: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    }).query(async () => {
    return keywordService.generateLinkingRecommendations();
  }),

  /**
   * Get keyword suggestions for a category
   */
  getKeywordSuggestions: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .input(z.object({ category: z.string() }))
    .query(async ({ input }: { input: any }) => {
      return keywordService.getKeywordSuggestions(input.category);
    }),
});
