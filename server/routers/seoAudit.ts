import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

interface AuditRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pass" | "warning" | "fail";
  impact: string;
  suggestion: string;
}

/**
 * SEO Audit Router
 * Analyzes pages and provides optimization recommendations
 */
export const seoAuditRouter = router({
  // Analyze a single page for SEO issues
  analyzePage: protectedProcedure
    .input(z.object({ pageSlug: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can run SEO audits",
        });
      }

      try {
        const recommendations: AuditRecommendation[] = [];

        // Mock analysis - in production, fetch actual page data
        const mockPageData = {
          metaTitle: "BIM Design Services | IMI Design",
          metaDescription: "Professional BIM design services for building projects",
          hasOgImage: true,
          hasH1: true,
          wordCount: 850,
          hasInternalLinks: true,
          hasExternalLinks: true,
          loadTime: 1.2,
        };

        // Meta Title Check
        if (!mockPageData.metaTitle) {
          recommendations.push({
            id: "meta-title-missing",
            title: "Missing Meta Title",
            description: "No meta title found for this page",
            priority: "critical",
            status: "fail",
            impact: "Severely impacts click-through rates from search results",
            suggestion: "Add a compelling meta title (50-60 characters) that includes your target keyword",
          });
        } else if (mockPageData.metaTitle.length < 30) {
          recommendations.push({
            id: "meta-title-short",
            title: "Meta Title Too Short",
            description: `Meta title is ${mockPageData.metaTitle.length} characters (recommended: 50-60)`,
            priority: "high",
            status: "warning",
            impact: "May be truncated in search results",
            suggestion: "Expand your meta title to 50-60 characters for better visibility",
          });
        } else if (mockPageData.metaTitle.length > 60) {
          recommendations.push({
            id: "meta-title-long",
            title: "Meta Title Too Long",
            description: `Meta title is ${mockPageData.metaTitle.length} characters (recommended: 50-60)`,
            priority: "medium",
            status: "warning",
            impact: "May be truncated in search results",
            suggestion: "Shorten your meta title to 50-60 characters",
          });
        } else {
          recommendations.push({
            id: "meta-title-good",
            title: "Meta Title Optimized",
            description: `Meta title is ${mockPageData.metaTitle.length} characters`,
            priority: "low",
            status: "pass",
            impact: "Good for search visibility",
            suggestion: "Keep this meta title as is",
          });
        }

        // Meta Description Check
        if (!mockPageData.metaDescription) {
          recommendations.push({
            id: "meta-desc-missing",
            title: "Missing Meta Description",
            description: "No meta description found for this page",
            priority: "high",
            status: "fail",
            impact: "Reduces click-through rates from search results",
            suggestion: "Add a compelling meta description (120-160 characters) with your target keyword",
          });
        } else if (mockPageData.metaDescription.length < 120) {
          recommendations.push({
            id: "meta-desc-short",
            title: "Meta Description Too Short",
            description: `Meta description is ${mockPageData.metaDescription.length} characters (recommended: 120-160)`,
            priority: "medium",
            status: "warning",
            impact: "May not fully display in search results",
            suggestion: "Expand your meta description to 120-160 characters",
          });
        } else if (mockPageData.metaDescription.length > 160) {
          recommendations.push({
            id: "meta-desc-long",
            title: "Meta Description Too Long",
            description: `Meta description is ${mockPageData.metaDescription.length} characters (recommended: 120-160)`,
            priority: "medium",
            status: "warning",
            impact: "Will be truncated in search results",
            suggestion: "Shorten your meta description to 120-160 characters",
          });
        } else {
          recommendations.push({
            id: "meta-desc-good",
            title: "Meta Description Optimized",
            description: `Meta description is ${mockPageData.metaDescription.length} characters`,
            priority: "low",
            status: "pass",
            impact: "Good for search visibility",
            suggestion: "Keep this meta description as is",
          });
        }

        // OG Image Check
        if (!mockPageData.hasOgImage) {
          recommendations.push({
            id: "og-image-missing",
            title: "Missing Open Graph Image",
            description: "No OG image found for social sharing",
            priority: "high",
            status: "fail",
            impact: "Reduces click-through rates from social media",
            suggestion: "Add an Open Graph image (1200x630px) for better social sharing",
          });
        } else {
          recommendations.push({
            id: "og-image-good",
            title: "Open Graph Image Present",
            description: "OG image is configured",
            priority: "low",
            status: "pass",
            impact: "Good for social media sharing",
            suggestion: "Keep this OG image as is",
          });
        }

        // H1 Tag Check
        if (!mockPageData.hasH1) {
          recommendations.push({
            id: "h1-missing",
            title: "Missing H1 Tag",
            description: "No H1 heading found on this page",
            priority: "high",
            status: "fail",
            impact: "Affects page structure and keyword relevance",
            suggestion: "Add a single H1 tag with your primary keyword",
          });
        } else {
          recommendations.push({
            id: "h1-good",
            title: "H1 Tag Present",
            description: "Page has an H1 heading",
            priority: "low",
            status: "pass",
            impact: "Good page structure",
            suggestion: "Keep your H1 tag as is",
          });
        }

        // Word Count Check
        if (mockPageData.wordCount < 300) {
          recommendations.push({
            id: "word-count-low",
            title: "Low Word Count",
            description: `Page has ${mockPageData.wordCount} words (recommended: 300+)`,
            priority: "high",
            status: "warning",
            impact: "May not rank well for competitive keywords",
            suggestion: "Expand your content to at least 300 words",
          });
        } else if (mockPageData.wordCount > 3000) {
          recommendations.push({
            id: "word-count-high",
            title: "High Word Count",
            description: `Page has ${mockPageData.wordCount} words`,
            priority: "low",
            status: "warning",
            impact: "Content may be too long",
            suggestion: "Consider breaking into multiple pages or sections",
          });
        } else {
          recommendations.push({
            id: "word-count-good",
            title: "Word Count Optimized",
            description: `Page has ${mockPageData.wordCount} words`,
            priority: "low",
            status: "pass",
            impact: "Good content length",
            suggestion: "Keep your content length as is",
          });
        }

        // Internal Links Check
        if (!mockPageData.hasInternalLinks) {
          recommendations.push({
            id: "internal-links-missing",
            title: "Missing Internal Links",
            description: "No internal links found on this page",
            priority: "medium",
            status: "warning",
            impact: "Reduces page authority distribution",
            suggestion: "Add 2-3 relevant internal links to other pages",
          });
        } else {
          recommendations.push({
            id: "internal-links-good",
            title: "Internal Links Present",
            description: "Page has internal links",
            priority: "low",
            status: "pass",
            impact: "Good for site structure",
            suggestion: "Keep your internal links as is",
          });
        }

        // Page Speed Check
        if (mockPageData.loadTime > 3) {
          recommendations.push({
            id: "page-speed-slow",
            title: "Slow Page Speed",
            description: `Page loads in ${mockPageData.loadTime}s (target: <2s)`,
            priority: "high",
            status: "warning",
            impact: "Affects rankings and user experience",
            suggestion: "Optimize images, enable caching, and minimize CSS/JS",
          });
        } else {
          recommendations.push({
            id: "page-speed-good",
            title: "Page Speed Optimized",
            description: `Page loads in ${mockPageData.loadTime}s`,
            priority: "low",
            status: "pass",
            impact: "Good user experience",
            suggestion: "Keep your page speed optimized",
          });
        }

        return {
          pageSlug: input.pageSlug,
          recommendations,
          summary: {
            total: recommendations.length,
            critical: recommendations.filter(r => r.priority === "critical").length,
            high: recommendations.filter(r => r.priority === "high").length,
            medium: recommendations.filter(r => r.priority === "medium").length,
            low: recommendations.filter(r => r.priority === "low").length,
            score: Math.max(0, 100 - (
              recommendations.filter(r => r.status === "fail").length * 20 +
              recommendations.filter(r => r.status === "warning").length * 10
            )),
          },
        };
      } catch (error) {
        console.error("[SEO_AUDIT] Error analyzing page:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze page",
        });
      }
    }),

  // Run audit on all pages
  auditAllPages: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can run SEO audits",
      });
    }

    try {
      // Mock data - in production, fetch all pages from database
      const pages = [
        "/",
        "/about",
        "/services",
        "/services/bim-design",
        "/services/mepf-design",
        "/projects",
        "/blog",
        "/contact",
      ];

      const results = pages.map(page => ({
        page,
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        issues: Math.floor(Math.random() * 5),
      }));

      const avgScore = Math.round(
        results.reduce((sum, r) => sum + r.score, 0) / results.length
      );

      return {
        results,
        summary: {
          totalPages: results.length,
          avgScore,
          pagesWithIssues: results.filter(r => r.issues > 0).length,
        },
      };
    } catch (error) {
      console.error("[SEO_AUDIT] Error auditing all pages:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to audit pages",
      });
    }
  }),
});
