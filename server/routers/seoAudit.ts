import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  auditPageSEO,
  saveAuditResult,
  getLatestAudit,
  getAuditHistory,
  getAllPageAudits,
  PAGE_AUDIT_DATA,
  type PageSEOData,
} from "../services/seoAuditService";

/**
 * SEO Audit Router - Handles SEO auditing and recommendations
 */
export const seoAuditRouter = router({
  /**
   * Run SEO audit on a specific page
   */
  auditPage: adminProcedure
    .input(
      z.object({
        pagePath: z.string(),
        pageData: z.object({
          title: z.string().optional(),
          metaDescription: z.string().optional(),
          metaKeywords: z.string().optional(),
          h1: z.string().optional(),
          imageCount: z.number().optional(),
          imageAltCount: z.number().optional(),
          internalLinks: z.number().optional(),
          externalLinks: z.number().optional(),
          wordCount: z.number().optional(),
          hasCanonical: z.boolean().optional(),
          hasOGTags: z.boolean().optional(),
          hasStructuredData: z.boolean().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Use provided data or get from predefined data
        const pageData = input.pageData || PAGE_AUDIT_DATA[input.pagePath];

        if (!pageData) {
          return {
            success: false,
            error: "Page data not found",
          };
        }

        // Run audit
        const auditResult = await auditPageSEO(pageData as PageSEOData);

        // Save to database
        await saveAuditResult(auditResult);

        return {
          success: true,
          audit: auditResult,
        };
      } catch (error) {
        console.error("Error auditing page:", error);
        return {
          success: false,
          error: "Failed to audit page",
        };
      }
    }),

  /**
   * Run audit on all predefined pages
   */
  auditAllPages: adminProcedure.mutation(async () => {
    try {
      const results = [];

      for (const [pagePath, pageData] of Object.entries(PAGE_AUDIT_DATA)) {
        const auditResult = await auditPageSEO(pageData);
        await saveAuditResult(auditResult);
        results.push(auditResult);
      }

      return {
        success: true,
        audits: results,
        totalPages: results.length,
        averageScore: Math.round(
          results.reduce((sum, r) => sum + r.score, 0) / results.length
        ),
      };
    } catch (error) {
      console.error("Error auditing all pages:", error);
      return {
        success: false,
        error: "Failed to audit pages",
      };
    }
  }),

  /**
   * Get latest audit for a page
   */
  getLatestAudit: adminProcedure
    .input(z.object({ pagePath: z.string() }))
    .query(async ({ input }) => {
      try {
        const audit = await getLatestAudit(input.pagePath);
        return audit || null;
      } catch (error) {
        console.error("Error fetching latest audit:", error);
        return null;
      }
    }),

  /**
   * Get audit history for a page
   */
  getAuditHistory: adminProcedure
    .input(
      z.object({
        pagePath: z.string(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await getAuditHistory(input.pagePath, input.limit);
        return history;
      } catch (error) {
        console.error("Error fetching audit history:", error);
        return [];
      }
    }),

  /**
   * Get all page audits (latest for each page)
   */
  getAllPageAudits: adminProcedure.query(async () => {
    try {
      const audits = await getAllPageAudits();

      // Sort by score descending
      const sorted = audits.sort((a: any, b: any) => b.score - a.score);

      // Calculate statistics
      const stats = {
        totalPages: sorted.length,
        averageScore: sorted.length > 0
          ? Math.round(sorted.reduce((sum: number, a: any) => sum + a.score, 0) / sorted.length)
          : 0,
        criticalIssues: sorted.reduce(
          (sum: number, a: any) => sum + (a.issues?.filter((i: any) => i.severity === "critical").length || 0),
          0
        ),
        highIssues: sorted.reduce(
          (sum: number, a: any) => sum + (a.issues?.filter((i: any) => i.severity === "high").length || 0),
          0
        ),
        mediumIssues: sorted.reduce(
          (sum: number, a: any) => sum + (a.issues?.filter((i: any) => i.severity === "medium").length || 0),
          0
        ),
        lowIssues: sorted.reduce(
          (sum: number, a: any) => sum + (a.issues?.filter((i: any) => i.severity === "low").length || 0),
          0
        ),
      };

      return {
        audits: sorted,
        statistics: stats,
      };
    } catch (error) {
      console.error("Error fetching all page audits:", error);
      return {
        audits: [],
        statistics: {
          totalPages: 0,
          averageScore: 0,
          criticalIssues: 0,
          highIssues: 0,
          mediumIssues: 0,
          lowIssues: 0,
        },
      };
    }
  }),

  /**
   * Get SEO recommendations for a page
   */
  getRecommendations: adminProcedure
    .input(z.object({ pagePath: z.string() }))
    .query(async ({ input }) => {
      try {
        const audit = await getLatestAudit(input.pagePath);

        if (!audit) {
          return {
            success: false,
            recommendations: [],
          };
        }

        // Get critical and high priority recommendations
        const recommendations = audit.issues
          ?.filter((i: any) => i.severity === "critical" || i.severity === "high")
          .map((i: any) => ({
            severity: i.severity,
            category: i.category,
            issue: i.issue,
            recommendation: i.recommendation,
            impact: i.impact,
          })) || [];

        return {
          success: true,
          pagePath: input.pagePath,
          score: audit.score,
          recommendations,
        };
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        return {
          success: false,
          recommendations: [],
        };
      }
    }),

  /**
   * Get SEO score trend for a page
   */
  getScoreTrend: adminProcedure
    .input(
      z.object({
        pagePath: z.string(),
        limit: z.number().default(7),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await getAuditHistory(input.pagePath, input.limit);

        const trend = history
          .reverse()
          .map((audit: any) => ({
            date: new Date(audit.auditedAt).toLocaleDateString(),
            score: audit.score,
            criticalIssues: audit.issues?.filter((i: any) => i.severity === "critical").length || 0,
            highIssues: audit.issues?.filter((i: any) => i.severity === "high").length || 0,
          }));

        return {
          success: true,
          pagePath: input.pagePath,
          trend,
        };
      } catch (error) {
        console.error("Error fetching score trend:", error);
        return {
          success: false,
          trend: [],
        };
      }
    }),

  /**
   * Get SEO health overview
   */
  getHealthOverview: adminProcedure.query(async () => {
    try {
      const audits = await getAllPageAudits();

      if (audits.length === 0) {
        return {
          success: false,
          message: "No audits found. Run audit first.",
        };
      }

      const scores = audits.map((a: any) => a.score);
      const avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);

      // Find pages with issues
      const pagesWithIssues = audits.filter((a: any) => a.score < 80);
      const criticalPages = audits.filter((a: any) => a.score < 60);

      // Get top recommendations
      const allRecommendations = audits
        .flatMap((a: any) => a.recommendations || [])
        .slice(0, 5);

      return {
        success: true,
        health: {
          overallScore: avgScore,
          totalPages: audits.length,
          pagesNeedingWork: pagesWithIssues.length,
          criticalPages: criticalPages.length,
          lastAuditDate: audits[0]?.auditedAt,
        },
        topRecommendations: allRecommendations,
        pageScores: audits.map((a: any) => ({
          page: a.pagePath,
          score: a.score,
          status: a.score >= 80 ? "good" : a.score >= 60 ? "fair" : "poor",
        })),
      };
    } catch (error) {
      console.error("Error fetching health overview:", error);
      return {
        success: false,
        message: "Failed to fetch health overview",
      };
    }
  }),
});
