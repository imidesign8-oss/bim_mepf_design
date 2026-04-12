import { getDb } from "../db";
import { keywords, keywordDensity, internalLinks } from "../../drizzle/schema";
import { eq, like, and } from "drizzle-orm";

/**
 * Keyword Management Service
 * Handles keyword tracking, density analysis, and optimization recommendations
 */

export async function addKeyword(data: {
  keyword: string;
  category?: string;
  searchVolume?: number;
  difficulty?: number;
  targetPosition?: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const result = await db.insert(keywords).values({
    keyword: data.keyword,
    category: data.category,
    searchVolume: data.searchVolume,
    difficulty: data.difficulty,
    targetPosition: data.targetPosition,
    notes: data.notes,
    relatedPages: JSON.stringify([]),
  });
  return result;
}

export async function getKeywords(category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  if (category) {
    return db.select().from(keywords).where(eq(keywords.category, category));
  }
  return db.select().from(keywords);
}

export async function getKeywordById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  return db.select().from(keywords).where(eq(keywords.id, id)).limit(1);
}

export async function updateKeyword(
  id: number,
  data: {
    keyword?: string;
    category?: string;
    searchVolume?: number;
    difficulty?: number;
    currentPosition?: number;
    targetPosition?: number;
    notes?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  return db.update(keywords).set(data).where(eq(keywords.id, id));
}

export async function deleteKeyword(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  return db.delete(keywords).where(eq(keywords.id, id));
}

/**
 * Keyword Density Analysis
 */
export async function analyzeKeywordDensity(
  pagePath: string,
  content: string,
  keywords_list: string[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const wordCount = content.split(/\s+/).length;
  const results = [];

  for (const keyword of keywords_list) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    const matches = content.match(regex) || [];
    const count = matches.length;
    const density = (count / wordCount) * 100;

    // Optimal keyword density is 1-3%
    let recommendations = "";
    if (density === 0) {
      recommendations = `Keyword "${keyword}" not found. Consider adding it naturally to the content.`;
    } else if (density < 1) {
      recommendations = `Keyword "${keyword}" density is ${density.toFixed(2)}%. Consider increasing mentions naturally.`;
    } else if (density > 3) {
      recommendations = `Keyword "${keyword}" density is ${density.toFixed(2)}%. This may be over-optimized. Reduce mentions to 1-3%.`;
    } else {
      recommendations = `Keyword "${keyword}" density is optimal at ${density.toFixed(2)}%.`;
    }

    await db.insert(keywordDensity).values({
      pagePath,
      keyword,
      density: density.toFixed(2) as any,
      count,
      wordCount,
      recommendations,
    });

    results.push({
      keyword,
      count,
      density: density.toFixed(2),
      recommendations,
    });
  }

  return results;
}

export async function getKeywordDensityForPage(pagePath: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  return db.select().from(keywordDensity).where(eq(keywordDensity.pagePath, pagePath));
}

/**
 * Internal Linking Management
 */
export async function addInternalLink(data: {
  sourcePagePath: string;
  targetPagePath: string;
  anchorText: string;
  linkType: "contextual" | "related" | "navigation" | "footer";
  keywordTarget?: string;
  position?: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  return db.insert(internalLinks).values(data);
}

export async function getInternalLinksFromPage(sourcePagePath: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  return db.select().from(internalLinks).where(eq(internalLinks.sourcePagePath, sourcePagePath));
}

export async function getInternalLinksToPage(targetPagePath: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  return db.select().from(internalLinks).where(eq(internalLinks.targetPagePath, targetPagePath));
}

export async function getAllInternalLinks() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  return db.select().from(internalLinks);
}

export async function updateInternalLink(
  id: number,
  data: {
    anchorText?: string;
    keywordTarget?: string;
    position?: number;
    notes?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  return db.update(internalLinks).set(data).where(eq(internalLinks.id, id));
}

export async function deleteInternalLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  return db.delete(internalLinks).where(eq(internalLinks.id, id));
}

/**
 * Internal Link Audit - Find orphaned pages and linking opportunities
 */
export async function auditInternalLinks() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const allLinks = await db.select().from(internalLinks);
  
  // Group links by source page
  const linksByPage = new Map<string, typeof allLinks>();
  for (const link of allLinks) {
    if (!linksByPage.has(link.sourcePagePath)) {
      linksByPage.set(link.sourcePagePath, []);
    }
    linksByPage.get(link.sourcePagePath)!.push(link);
  }

  // Find pages with few outgoing links (opportunity for more links)
  const pagesWithFewLinks = Array.from(linksByPage.entries())
    .filter(([_, links]) => links.length < 3)
    .map(([page, links]) => ({
      page,
      linkCount: links.length,
      recommendation: `Page has only ${links.length} internal links. Consider adding 2-3 more contextual links.`,
    }));

  // Find pages that are never linked to (orphaned)
  const targetPages = new Set(allLinks.map((l) => l.targetPagePath));
  const allPages = new Set(allLinks.map((l) => l.sourcePagePath));
  const orphanedPages = Array.from(allPages).filter((page) => !targetPages.has(page));

  return {
    totalLinks: allLinks.length,
    pagesWithFewLinks,
    orphanedPages,
    audit: {
      status: orphanedPages.length === 0 ? "good" : "needs_improvement",
      message:
        orphanedPages.length === 0
          ? "All pages are linked from other pages."
          : `${orphanedPages.length} pages are orphaned and not linked from any other page.`,
    },
  };
}

/**
 * Get keyword suggestions for a page based on category
 */
export function getKeywordSuggestions(category: string): string[] {
  const suggestions: Record<string, string[]> = {
    BIM: [
      "BIM design services",
      "Building Information Modeling",
      "BIM coordination",
      "BIM consulting",
      "3D BIM modeling",
      "BIM for construction",
      "BIM MEP coordination",
      "BIM clash detection",
    ],
    MEPF: [
      "MEP design",
      "MEPF services",
      "Mechanical design",
      "Electrical design",
      "Plumbing design",
      "Fire safety design",
      "MEP coordination",
      "HVAC design",
    ],
    Design: [
      "architectural design",
      "design services",
      "CAD design",
      "design consulting",
      "engineering design",
      "technical design",
      "design optimization",
    ],
  };

  return suggestions[category] || [];
}

/**
 * Generate internal linking recommendations
 */
export async function generateLinkingRecommendations() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const allKeywords = await db.select().from(keywords);
  const allLinks = await db.select().from(internalLinks);

  const recommendations = [];

  for (const keyword of allKeywords) {
    const relatedPages = keyword.relatedPages ? JSON.parse(keyword.relatedPages) : [];
    
    // Check if keyword has enough internal links
    const keywordLinks = allLinks.filter(
      (l) => l.keywordTarget === keyword.keyword
    );

    if (keywordLinks.length === 0 && relatedPages.length > 0) {
      recommendations.push({
        keyword: keyword.keyword,
        type: "missing_links",
        message: `No internal links found for keyword "${keyword.keyword}". Consider adding links from related pages.`,
        relatedPages,
      });
    } else if (keywordLinks.length === 1) {
      recommendations.push({
        keyword: keyword.keyword,
        type: "few_links",
        message: `Only 1 internal link found for keyword "${keyword.keyword}". Consider adding 1-2 more links from relevant pages.`,
        currentLinks: keywordLinks.length,
      });
    }
  }

  return recommendations;
}
