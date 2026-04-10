/**
 * Article Schema Markup Generator
 * Generates Schema.org Article markup for blog posts with reading time
 */

import { useEffect } from "react";

export interface ArticleSchemaData {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: {
      url: string;
      width: number;
      height: number;
    };
  };
  wordCount?: number;
  readingTime?: number; // in minutes
  keywords?: string[];
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Generate Article schema markup
 */
export function generateArticleSchema(data: ArticleSchemaData) {
  const readingTime = data.readingTime || (data.wordCount ? calculateReadingTime(data.wordCount) : 5);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.headline,
    description: data.description,
    url: data.url,
    ...(data.image && { image: data.image }),
    datePublished: data.datePublished,
    ...(data.dateModified && { dateModified: data.dateModified }),
    author: {
      "@type": "Person",
      name: data.author.name,
      ...(data.author.url && { url: data.author.url }),
    },
    ...(data.publisher && {
      publisher: {
        "@type": "Organization",
        name: data.publisher.name,
        ...(data.publisher.logo && {
          logo: {
            "@type": "ImageObject",
            url: data.publisher.logo.url,
            width: data.publisher.logo.width,
            height: data.publisher.logo.height,
          },
        }),
      },
    }),
    ...(data.wordCount && { wordCount: data.wordCount }),
    timeRequired: `PT${readingTime}M`, // ISO 8601 duration format
    ...(data.keywords && { keywords: data.keywords.join(", ") }),
  };

  return schema;
}

/**
 * Add Article schema to page head
 */
export function addArticleSchema(data: ArticleSchemaData) {
  const schema = generateArticleSchema(data);
  const scriptId = `article-schema-${data.url.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

  // Remove existing schema if present
  const existingScript = document.getElementById(scriptId);
  if (existingScript) {
    existingScript.remove();
  }

  // Create and add new schema
  const script = document.createElement("script");
  script.id = scriptId;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Remove Article schema from page
 */
export function removeArticleSchema(url: string) {
  const scriptId = `article-schema-${url.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  const script = document.getElementById(scriptId);
  if (script) {
    script.remove();
  }
}

/**
 * Hook to add article schema to page
 */
export function useArticleSchema(data: ArticleSchemaData) {
  useEffect(() => {
    addArticleSchema(data);

    // Cleanup on unmount
    return () => {
      removeArticleSchema(data.url);
    };
  }, [data]);
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return "< 1 min read";
  }
  return `${minutes} min read`;
}

/**
 * Get estimated reading time from content
 */
export function getReadingTimeFromContent(content: string): number {
  const wordCount = countWords(content);
  return calculateReadingTime(wordCount);
}

/**
 * Format date to ISO 8601 format
 */
export function formatDateToISO(date: Date | string): string {
  if (typeof date === "string") {
    return new Date(date).toISOString().split("T")[0];
  }
  return date.toISOString().split("T")[0];
}
