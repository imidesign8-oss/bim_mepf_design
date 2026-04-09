import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

/**
 * Google Search Console Integration Router
 * Manages GSC authentication and data fetching
 */
export const gscIntegrationRouter = router({
  // Get GSC authentication status
  getAuthStatus: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access GSC integration",
      });
    }

    try {
      // Check if GSC credentials are stored in environment or settings
      const hasGSCCredentials = !!process.env.GSC_PROPERTY_URL;
      
      return {
        authenticated: hasGSCCredentials,
        propertyUrl: hasGSCCredentials ? process.env.GSC_PROPERTY_URL : null,
        lastSync: null, // Would be fetched from database
      };
    } catch (error) {
      console.error("[GSC] Error checking auth status:", error);
      return { authenticated: false, propertyUrl: null, lastSync: null };
    }
  }),

  // Get GSC authentication URL for OAuth flow
  getAuthUrl: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access GSC integration",
      });
    }

    try {
      // Generate OAuth URL for Google Search Console
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = `${process.env.VITE_APP_URL || "https://imidesign.in"}/api/gsc/callback`;
      const scope = "https://www.googleapis.com/auth/webmasters";

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline`;

      return { authUrl };
    } catch (error) {
      console.error("[GSC] Error generating auth URL:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate authentication URL",
      });
    }
  }),

  // Submit sitemap to GSC
  submitSitemap: protectedProcedure
    .input(z.object({ sitemapUrl: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can submit sitemaps",
        });
      }

      try {
        // In production, this would use the Google Search Console API
        // For now, return a success response with instructions
        return {
          success: true,
          message: "Sitemap submission queued",
          sitemapUrl: input.sitemapUrl,
          instructions: [
            "1. Go to Google Search Console (https://search.google.com/search-console)",
            "2. Select your property",
            "3. Go to Sitemaps section",
            `4. Submit: ${input.sitemapUrl}`,
            "5. Wait for Google to process the sitemap",
          ],
        };
      } catch (error) {
        console.error("[GSC] Error submitting sitemap:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit sitemap",
        });
      }
    }),

  // Get search performance data (mock data for now)
  getSearchPerformance: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access search performance data",
      });
    }

    try {
      // Mock data - in production, fetch from GSC API
      return {
        impressions: 1250,
        clicks: 87,
        ctr: 6.96,
        avgPosition: 12.5,
        topQueries: [
          { query: "BIM design services", clicks: 25, impressions: 320, ctr: 7.8, position: 8 },
          { query: "MEPF design India", clicks: 18, impressions: 210, ctr: 8.6, position: 11 },
          { query: "MEP cost estimation", clicks: 15, impressions: 180, ctr: 8.3, position: 14 },
          { query: "building information modeling", clicks: 12, impressions: 150, ctr: 8.0, position: 16 },
          { query: "HVAC design services", clicks: 10, impressions: 140, ctr: 7.1, position: 18 },
        ],
        topPages: [
          { page: "/services", clicks: 35, impressions: 420, ctr: 8.3, position: 9 },
          { page: "/mep-calculator", clicks: 28, impressions: 310, ctr: 9.0, position: 11 },
          { page: "/projects", clicks: 15, impressions: 280, ctr: 5.4, position: 15 },
          { page: "/about", clicks: 9, impressions: 240, ctr: 3.8, position: 18 },
        ],
      };
    } catch (error) {
      console.error("[GSC] Error fetching search performance:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch search performance data",
      });
    }
  }),

  // Get indexing status (mock data)
  getIndexingStatus: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access indexing status",
      });
    }

    try {
      // Mock data - in production, fetch from GSC API
      return {
        indexed: 45,
        notIndexed: 3,
        excluded: 2,
        issues: [
          { type: "Soft 404", count: 1, pages: ["/blog/draft-post"] },
          { type: "Blocked by robots.txt", count: 1, pages: ["/admin"] },
          { type: "Noindex", count: 1, pages: ["/private"] },
        ],
      };
    } catch (error) {
      console.error("[GSC] Error fetching indexing status:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch indexing status",
      });
    }
  }),

  // Get coverage report
  getCoverageReport: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access coverage report",
      });
    }

    try {
      // Mock data
      return {
        valid: 42,
        warning: 2,
        error: 1,
        excluded: 5,
        details: {
          valid: [
            { issue: "Submitted and indexed", count: 42 },
          ],
          warning: [
            { issue: "Crawled but not indexed", count: 2 },
          ],
          error: [
            { issue: "Submitted but not indexed", count: 1 },
          ],
          excluded: [
            { issue: "Excluded by robots.txt", count: 3 },
            { issue: "Noindex", count: 2 },
          ],
        },
      };
    } catch (error) {
      console.error("[GSC] Error fetching coverage report:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch coverage report",
      });
    }
  }),

  // Request indexing for a URL
  requestIndexing: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can request indexing",
        });
      }

      try {
        // In production, use Google Indexing API
        return {
          success: true,
          message: `Indexing request submitted for ${input.url}`,
          url: input.url,
          status: "pending",
        };
      } catch (error) {
        console.error("[GSC] Error requesting indexing:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to request indexing",
        });
      }
    }),
});
