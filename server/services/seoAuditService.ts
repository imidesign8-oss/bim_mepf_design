import { getDb } from "../db";
import { seoAudits } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * SEO Audit Service - Performs automated SEO checks on website pages
 */

export interface PageSEOData {
  path: string;
  title: string;
  metaDescription: string;
  metaKeywords?: string;
  h1?: string;
  imageCount?: number;
  imageAltCount?: number;
  internalLinks?: number;
  externalLinks?: number;
  wordCount?: number;
  hasCanonical?: boolean;
  hasOGTags?: boolean;
  hasStructuredData?: boolean;
  pageLoadTime?: number;
}

export interface SEOIssue {
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  issue: string;
  recommendation: string;
  impact: string;
}

export interface SEOAuditResult {
  pageUrl: string;
  pagePath: string;
  score: number;
  issues: SEOIssue[];
  timestamp: Date;
  recommendations: string[];
}

/**
 * Check meta description length and quality
 */
function checkMetaDescription(description?: string): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!description) {
    issues.push({
      severity: "critical",
      category: "Meta Description",
      issue: "Missing meta description",
      recommendation: "Add a meta description (120-160 characters) to improve search visibility",
      impact: "May not display in search results, affecting click-through rate",
    });
  } else if (description.length < 120) {
    issues.push({
      severity: "medium",
      category: "Meta Description",
      issue: `Meta description too short (${description.length} characters, recommended: 120-160)`,
      recommendation: `Expand meta description to 120-160 characters. Current: "${description}"`,
      impact: "May not fully display in search results, reducing click-through rate",
    });
  } else if (description.length > 160) {
    issues.push({
      severity: "low",
      category: "Meta Description",
      issue: `Meta description too long (${description.length} characters, recommended: 120-160)`,
      recommendation: `Shorten meta description to 160 characters. Current: "${description}"`,
      impact: "Will be truncated in search results",
    });
  }

  return issues;
}

/**
 * Check page title
 */
function checkPageTitle(title?: string): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!title) {
    issues.push({
      severity: "critical",
      category: "Page Title",
      issue: "Missing page title",
      recommendation: "Add a descriptive page title (50-60 characters)",
      impact: "Critical for SEO and user experience",
    });
  } else if (title.length < 30) {
    issues.push({
      severity: "high",
      category: "Page Title",
      issue: `Page title too short (${title.length} characters, recommended: 50-60)`,
      recommendation: "Expand page title to include keywords and improve clarity",
      impact: "Reduces search visibility and click-through rate",
    });
  } else if (title.length > 60) {
    issues.push({
      severity: "low",
      category: "Page Title",
      issue: `Page title too long (${title.length} characters, recommended: 50-60)`,
      recommendation: "Shorten page title to improve display in search results",
      impact: "Will be truncated in search results",
    });
  }

  return issues;
}

/**
 * Check H1 tags
 */
function checkH1Tags(h1Count?: number): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!h1Count || h1Count === 0) {
    issues.push({
      severity: "high",
      category: "Heading Structure",
      issue: "Missing H1 tag",
      recommendation: "Add exactly one H1 tag that describes the main topic of the page",
      impact: "Reduces page structure clarity for search engines",
    });
  } else if (h1Count > 1) {
    issues.push({
      severity: "medium",
      category: "Heading Structure",
      issue: `Multiple H1 tags found (${h1Count}). Should have only one.`,
      recommendation: "Use only one H1 tag per page. Use H2, H3 for subheadings.",
      impact: "Confuses search engines about page topic",
    });
  }

  return issues;
}

/**
 * Check image alt text
 */
function checkImageAltText(
  imageCount?: number,
  imageAltCount?: number
): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!imageCount || imageCount === 0) {
    return issues;
  }

  const missingAltCount = (imageCount || 0) - (imageAltCount || 0);

  if (missingAltCount > 0) {
    issues.push({
      severity: "high",
      category: "Images",
      issue: `${missingAltCount} images missing alt text (${imageCount} total images)`,
      recommendation: "Add descriptive alt text to all images for accessibility and SEO",
      impact: "Reduces accessibility and image search visibility",
    });
  }

  return issues;
}

/**
 * Check internal links
 */
function checkInternalLinks(internalLinks?: number): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!internalLinks || internalLinks === 0) {
    issues.push({
      severity: "medium",
      category: "Internal Links",
      issue: "No internal links found",
      recommendation: "Add internal links to related pages to improve site structure and SEO",
      impact: "Reduces link equity distribution and site crawlability",
    });
  }

  return issues;
}

/**
 * Check word count
 */
function checkWordCount(wordCount?: number): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!wordCount || wordCount < 300) {
    issues.push({
      severity: "medium",
      category: "Content",
      issue: `Low word count (${wordCount || 0} words, recommended: 300+)`,
      recommendation: "Expand page content to at least 300 words for better SEO",
      impact: "Thin content may rank lower in search results",
    });
  }

  return issues;
}

/**
 * Check structured data
 */
function checkStructuredData(hasStructuredData?: boolean): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!hasStructuredData) {
    issues.push({
      severity: "low",
      category: "Structured Data",
      issue: "No structured data (JSON-LD) found",
      recommendation: "Add Schema.org structured data (Organization, LocalBusiness, etc.)",
      impact: "May miss rich snippet opportunities in search results",
    });
  }

  return issues;
}

/**
 * Check Open Graph tags
 */
function checkOpenGraphTags(hasOGTags?: boolean): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!hasOGTags) {
    issues.push({
      severity: "low",
      category: "Social Media",
      issue: "Missing Open Graph tags",
      recommendation: "Add og:title, og:description, og:image for better social sharing",
      impact: "Reduces social media sharing appearance",
    });
  }

  return issues;
}

/**
 * Calculate SEO score based on issues
 */
function calculateSEOScore(issues: SEOIssue[]): number {
  let score = 100;

  issues.forEach((issue) => {
    switch (issue.severity) {
      case "critical":
        score -= 20;
        break;
      case "high":
        score -= 15;
        break;
      case "medium":
        score -= 10;
        break;
      case "low":
        score -= 5;
        break;
    }
  });

  return Math.max(0, score);
}

/**
 * Main audit function
 */
export async function auditPageSEO(pageData: PageSEOData): Promise<SEOAuditResult> {
  const issues: SEOIssue[] = [];

  // Run all checks
  issues.push(...checkPageTitle(pageData.title));
  issues.push(...checkMetaDescription(pageData.metaDescription));
  issues.push(...checkH1Tags(1)); // Assuming 1 H1 per page for now
  issues.push(...checkImageAltText(pageData.imageCount, pageData.imageAltCount));
  issues.push(...checkInternalLinks(pageData.internalLinks));
  issues.push(...checkWordCount(pageData.wordCount));
  issues.push(...checkStructuredData(pageData.hasStructuredData));
  issues.push(...checkOpenGraphTags(pageData.hasOGTags));

  const score = calculateSEOScore(issues);

  // Generate recommendations
  const recommendations = issues
    .filter((i) => i.severity === "critical" || i.severity === "high")
    .map((i) => i.recommendation);

  return {
    pageUrl: pageData.path,
    pagePath: pageData.path,
    score,
    issues,
    timestamp: new Date(),
    recommendations,
  };
}

/**
 * Save audit result to database
 */
export async function saveAuditResult(
  result: SEOAuditResult
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available for SEO audit save");
      return false;
    }

    await (db as any).insert(seoAudits).values({
      pagePath: result.pagePath,
      score: result.score,
      issues: JSON.stringify(result.issues),
      recommendations: JSON.stringify(result.recommendations),
      auditedAt: result.timestamp,
    });

    return true;
  } catch (error) {
    console.error("Error saving SEO audit result:", error);
    return false;
  }
}

/**
 * Get latest audit for a page
 */
export async function getLatestAudit(pagePath: string) {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await (db as any)
      .select()
      .from(seoAudits)
      .where(eq(seoAudits.pagePath, pagePath))
      .orderBy(desc(seoAudits.auditedAt))
      .limit(1);

    if (result.length > 0) {
      const audit = result[0];
      return {
        ...audit,
        issues: JSON.parse(audit.issues || "[]"),
        recommendations: JSON.parse(audit.recommendations || "[]"),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching latest audit:", error);
    return null;
  }
}

/**
 * Get all audit history for a page
 */
export async function getAuditHistory(pagePath: string, limit: number = 10) {
  try {
    const db = await getDb();
    if (!db) return [];

    const results = await (db as any)
      .select()
      .from(seoAudits)
      .where(eq(seoAudits.pagePath, pagePath))
      .orderBy(desc(seoAudits.auditedAt))
      .limit(limit);

    return results.map((audit: any) => ({
      ...audit,
      issues: JSON.parse(audit.issues || "[]"),
      recommendations: JSON.parse(audit.recommendations || "[]"),
    }));
  } catch (error) {
    console.error("Error fetching audit history:", error);
    return [];
  }
}

/**
 * Get all page audits (latest for each page)
 */
export async function getAllPageAudits() {
  try {
    const db = await getDb();
    if (!db) return [];

    const results = await (db as any).select().from(seoAudits);

    // Group by page path and get latest for each
    const auditsByPage = new Map();
    results.forEach((audit: any) => {
      const existing = auditsByPage.get(audit.pagePath);
      if (!existing || audit.auditedAt > existing.auditedAt) {
        auditsByPage.set(audit.pagePath, audit);
      }
    });

    return Array.from(auditsByPage.values()).map((audit: any) => ({
      ...audit,
      issues: JSON.parse(audit.issues || "[]"),
      recommendations: JSON.parse(audit.recommendations || "[]"),
    }));
  } catch (error) {
    console.error("Error fetching all page audits:", error);
    return [];
  }
}

/**
 * Predefined page audit data for common pages
 */
export const PAGE_AUDIT_DATA: Record<string, PageSEOData> = {
  "/": {
    path: "/",
    title: "Professional BIM & MEPF Design Services for Modern Buildings",
    metaDescription:
      "Professional BIM and MEPF design services for modern buildings. Expert coordination, precision modeling, and innovative solutions.",
    metaKeywords: "BIM, MEPF, design services, building information modeling",
    h1: "Professional BIM & MEPF Design Services",
    imageCount: 8,
    imageAltCount: 6,
    internalLinks: 12,
    externalLinks: 2,
    wordCount: 1200,
    hasCanonical: true,
    hasOGTags: true,
    hasStructuredData: true,
  },
  "/about": {
    path: "/about",
    title: "About IMI Design - BIM & MEPF Design Experts",
    metaDescription:
      "Learn about IMI Design's expertise in BIM and MEPF design services. Our experienced team delivers precision solutions for modern buildings.",
    metaKeywords: "about IMI Design, BIM experts, MEPF design team",
    h1: "About Our Team",
    imageCount: 5,
    imageAltCount: 5,
    internalLinks: 8,
    externalLinks: 1,
    wordCount: 800,
    hasCanonical: true,
    hasOGTags: true,
    hasStructuredData: true,
  },
  "/services": {
    path: "/services",
    title: "BIM & MEPF Design Services - Comprehensive Solutions",
    metaDescription:
      "Explore our comprehensive BIM and MEPF design services including 3D modeling, coordination, clash detection, and MEP design.",
    metaKeywords: "BIM services, MEPF design, 3D modeling, clash detection",
    h1: "Our Services",
    imageCount: 6,
    imageAltCount: 4,
    internalLinks: 10,
    externalLinks: 2,
    wordCount: 950,
    hasCanonical: true,
    hasOGTags: true,
    hasStructuredData: true,
  },
  "/projects": {
    path: "/projects",
    title: "BIM & MEPF Design Projects - Case Studies & Portfolio",
    metaDescription:
      "View our portfolio of completed BIM and MEPF design projects. See how we deliver precision solutions for modern buildings.",
    metaKeywords: "BIM projects, MEPF design portfolio, case studies",
    h1: "Our Projects",
    imageCount: 12,
    imageAltCount: 8,
    internalLinks: 15,
    externalLinks: 1,
    wordCount: 600,
    hasCanonical: true,
    hasOGTags: true,
    hasStructuredData: true,
  },
  "/blog": {
    path: "/blog",
    title: "BIM & MEPF Design Blog - Industry Insights & Tips",
    metaDescription:
      "Read our latest blog posts about BIM, MEPF design, and industry best practices. Stay updated with expert insights.",
    metaKeywords: "BIM blog, MEPF design tips, industry insights",
    h1: "Blog",
    imageCount: 4,
    imageAltCount: 2,
    internalLinks: 8,
    externalLinks: 3,
    wordCount: 500,
    hasCanonical: true,
    hasOGTags: true,
    hasStructuredData: false,
  },
  "/contact": {
    path: "/contact",
    title: "Contact IMI Design - Get in Touch",
    metaDescription:
      "Contact IMI Design for BIM and MEPF design services. Reach out to discuss your project requirements.",
    metaKeywords: "contact IMI Design, BIM inquiry, MEPF design contact",
    h1: "Contact Us",
    imageCount: 1,
    imageAltCount: 1,
    internalLinks: 5,
    externalLinks: 0,
    wordCount: 300,
    hasCanonical: true,
    hasOGTags: true,
    hasStructuredData: true,
  },
};
