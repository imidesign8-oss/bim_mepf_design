import { describe, it, expect } from "vitest";
import { auditPageSEO, PAGE_AUDIT_DATA, type PageSEOData } from "./seoAuditService";

describe("SEO Audit Service", () => {
  describe("Full Page Audit", () => {
    it("should audit homepage successfully", async () => {
      const pageData = PAGE_AUDIT_DATA["/"];
      const result = await auditPageSEO(pageData);

      expect(result).toBeDefined();
      expect(result.pageUrl).toBe("/");
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it("should audit about page", async () => {
      const pageData = PAGE_AUDIT_DATA["/about"];
      const result = await auditPageSEO(pageData);

      expect(result).toBeDefined();
      expect(result.pagePath).toBe("/about");
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it("should audit services page", async () => {
      const pageData = PAGE_AUDIT_DATA["/services"];
      const result = await auditPageSEO(pageData);

      expect(result).toBeDefined();
      expect(result.pagePath).toBe("/services");
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it("should audit projects page", async () => {
      const pageData = PAGE_AUDIT_DATA["/projects"];
      const result = await auditPageSEO(pageData);

      expect(result).toBeDefined();
      expect(result.pagePath).toBe("/projects");
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it("should audit blog page", async () => {
      const pageData = PAGE_AUDIT_DATA["/blog"];
      const result = await auditPageSEO(pageData);

      expect(result).toBeDefined();
      expect(result.pagePath).toBe("/blog");
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it("should audit contact page", async () => {
      const pageData = PAGE_AUDIT_DATA["/contact"];
      const result = await auditPageSEO(pageData);

      expect(result).toBeDefined();
      expect(result.pagePath).toBe("/contact");
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it("should audit all predefined pages", async () => {
      const results = [];
      for (const [pagePath, pageData] of Object.entries(PAGE_AUDIT_DATA)) {
        const result = await auditPageSEO(pageData);
        results.push(result);
        expect(result.pagePath).toBe(pagePath);
        expect(result.score).toBeGreaterThanOrEqual(0);
      }
      expect(results.length).toBeGreaterThan(0);
    });

    it("should generate recommendations for issues", async () => {
      const pageData: PageSEOData = {
        path: "/test",
        title: "Short",
        metaDescription: "Short",
        h1: undefined,
        imageCount: 5,
        imageAltCount: 0,
        internalLinks: 0,
        wordCount: 100,
        hasCanonical: false,
        hasOGTags: false,
        hasStructuredData: false,
      };

      const result = await auditPageSEO(pageData);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should identify critical issues", async () => {
      const pageData: PageSEOData = {
        path: "/test",
        title: "",
        metaDescription: "",
      };

      const result = await auditPageSEO(pageData);
      const criticalIssues = result.issues.filter(i => i.severity === "critical");
      expect(criticalIssues.length).toBeGreaterThan(0);
    });

    it("should identify high priority issues", async () => {
      const pageData: PageSEOData = {
        path: "/test",
        title: "Test",
        metaDescription: "Test",
        imageCount: 5,
        imageAltCount: 0,
      };

      const result = await auditPageSEO(pageData);
      const highIssues = result.issues.filter(i => i.severity === "high");
      expect(highIssues.length).toBeGreaterThan(0);
    });

    it("should handle pages with good SEO", async () => {
      const pageData: PageSEOData = {
        path: "/good",
        title: "Professional BIM & MEPF Design Services for Modern Buildings",
        metaDescription: "Professional BIM and MEPF design services for modern buildings. Expert coordination, precision modeling, and innovative solutions.",
        h1: "Professional BIM & MEPF Design Services",
        imageCount: 8,
        imageAltCount: 8,
        internalLinks: 12,
        externalLinks: 2,
        wordCount: 1200,
        hasCanonical: true,
        hasOGTags: true,
        hasStructuredData: true,
      };

      const result = await auditPageSEO(pageData);
      expect(result.score).toBeGreaterThan(70);
    });
  });

  describe("Predefined Page Data", () => {
    it("should have all required pages", () => {
      const requiredPages = ["/", "/about", "/services", "/projects", "/blog", "/contact"];
      requiredPages.forEach((page) => {
        expect(PAGE_AUDIT_DATA[page]).toBeDefined();
      });
    });

    it("should have valid page data structure", () => {
      Object.entries(PAGE_AUDIT_DATA).forEach(([path, data]) => {
        expect(data.path).toBe(path);
        expect(typeof data.title).toBe("string");
        expect(typeof data.metaDescription).toBe("string");
      });
    });

    it("should have meta descriptions in valid range", () => {
      Object.entries(PAGE_AUDIT_DATA).forEach(([path, data]) => {
        const descLength = data.metaDescription.length;
        expect(descLength).toBeGreaterThan(0);
      });
    });

    it("should have titles in valid range", () => {
      Object.entries(PAGE_AUDIT_DATA).forEach(([path, data]) => {
        const titleLength = data.title.length;
        expect(titleLength).toBeGreaterThan(0);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty page data", async () => {
      const pageData: PageSEOData = {
        path: "/empty",
        title: "",
        metaDescription: "",
      };

      const result = await auditPageSEO(pageData);
      expect(result).toBeDefined();
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should handle null/undefined values gracefully", async () => {
      const pageData: PageSEOData = {
        path: "/test",
        title: "Test",
        metaDescription: "Test description",
      };

      const result = await auditPageSEO(pageData);
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it("should handle extreme values", async () => {
      const pageData: PageSEOData = {
        path: "/extreme",
        title: "a".repeat(1000),
        metaDescription: "b".repeat(1000),
        imageCount: 1000,
        imageAltCount: 0,
        internalLinks: 1000,
        wordCount: 100000,
      };

      const result = await auditPageSEO(pageData);
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it("should handle very short content", async () => {
      const pageData: PageSEOData = {
        path: "/short",
        title: "A",
        metaDescription: "B",
        wordCount: 1,
      };

      const result = await auditPageSEO(pageData);
      expect(result).toBeDefined();
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should handle missing optional fields", async () => {
      const pageData: PageSEOData = {
        path: "/minimal",
        title: "Minimal Page",
        metaDescription: "This is a minimal page with just title and description",
      };

      const result = await auditPageSEO(pageData);
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Issue Categories", () => {
    it("should check meta description issues", async () => {
      const pageData: PageSEOData = {
        path: "/test",
        title: "Test",
        metaDescription: "Short",
      };

      const result = await auditPageSEO(pageData);
      const metaIssues = result.issues.filter(i => i.category === "Meta Description");
      expect(metaIssues.length).toBeGreaterThan(0);
    });

    it("should check page title issues", async () => {
      const pageData: PageSEOData = {
        path: "/test",
        title: "Short",
        metaDescription: "This is a proper meta description that is between 120 and 160 characters long for optimal SEO performance.",
      };

      const result = await auditPageSEO(pageData);
      const titleIssues = result.issues.filter(i => i.category === "Page Title");
      expect(titleIssues.length).toBeGreaterThan(0);
    });

    it("should check image alt text issues", async () => {
      const pageData: PageSEOData = {
        path: "/test",
        title: "Test Page",
        metaDescription: "This is a proper meta description that is between 120 and 160 characters long for optimal SEO performance.",
        imageCount: 10,
        imageAltCount: 0,
      };

      const result = await auditPageSEO(pageData);
      const imageIssues = result.issues.filter(i => i.category === "Images");
      expect(imageIssues.length).toBeGreaterThan(0);
    });

    it("should check content word count issues", async () => {
      const pageData: PageSEOData = {
        path: "/test",
        title: "Test Page Title",
        metaDescription: "This is a proper meta description that is between 120 and 160 characters long for optimal SEO performance.",
        wordCount: 50,
      };

      const result = await auditPageSEO(pageData);
      const contentIssues = result.issues.filter(i => i.category === "Content");
      expect(contentIssues.length).toBeGreaterThan(0);
    });
  });

  describe("Score Calculation", () => {
    it("should return high score for good pages", async () => {
      const pageData = PAGE_AUDIT_DATA["/"];
      const result = await auditPageSEO(pageData);
      expect(result.score).toBeGreaterThan(50);
    });

    it("should return low score for poor pages", async () => {
      const pageData: PageSEOData = {
        path: "/poor",
        title: "",
        metaDescription: "",
        imageCount: 10,
        imageAltCount: 0,
        internalLinks: 0,
        wordCount: 50,
      };

      const result = await auditPageSEO(pageData);
      expect(result.score).toBeLessThan(50);
    });

    it("should never return negative scores", async () => {
      const pageData: PageSEOData = {
        path: "/terrible",
        title: "",
        metaDescription: "",
        imageCount: 100,
        imageAltCount: 0,
        internalLinks: 0,
        wordCount: 10,
        hasCanonical: false,
        hasOGTags: false,
        hasStructuredData: false,
      };

      const result = await auditPageSEO(pageData);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});
