import { describe, it, expect } from "vitest";
import {
  calculateReadingTime,
  countWords,
  generateArticleSchema,
  formatReadingTime,
  getReadingTimeFromContent,
  formatDateToISO,
} from "./articleSchema";

describe("Article Schema Utilities", () => {
  describe("Word Counting", () => {
    it("should count words correctly", () => {
      const text = "This is a test sentence with ten words in total here";
      expect(countWords(text)).toBe(10);
    });

    it("should handle empty strings", () => {
      expect(countWords("")).toBe(0);
    });

    it("should handle whitespace-only strings", () => {
      expect(countWords("   \n\t  ")).toBe(0);
    });

    it("should count words with punctuation", () => {
      const text = "Hello, world! This is a test.";
      expect(countWords(text)).toBeGreaterThan(0);
    });

    it("should handle multiple spaces between words", () => {
      const text = "Word1    Word2    Word3";
      expect(countWords(text)).toBe(3);
    });

    it("should count words in long text", () => {
      const text = Array(100).fill("word").join(" ");
      expect(countWords(text)).toBe(100);
    });
  });

  describe("Reading Time Calculation", () => {
    it("should calculate reading time for 200 words as 1 minute", () => {
      expect(calculateReadingTime(200)).toBe(1);
    });

    it("should round up reading time", () => {
      expect(calculateReadingTime(201)).toBe(2);
      expect(calculateReadingTime(150)).toBe(1);
    });

    it("should handle short content", () => {
      expect(calculateReadingTime(50)).toBe(1);
    });

    it("should handle long content", () => {
      expect(calculateReadingTime(2000)).toBe(10);
    });

    it("should return 1 minute minimum", () => {
      expect(calculateReadingTime(1)).toBe(1);
    });

    it("should calculate for typical blog post", () => {
      // Typical blog post: 1000 words = 5 minutes
      expect(calculateReadingTime(1000)).toBe(5);
    });
  });

  describe("Reading Time Formatting", () => {
    it("should format single minute", () => {
      expect(formatReadingTime(1)).toBe("1 min read");
    });

    it("should format multiple minutes", () => {
      expect(formatReadingTime(5)).toBe("5 min read");
      expect(formatReadingTime(10)).toBe("10 min read");
    });

    it("should handle less than 1 minute", () => {
      expect(formatReadingTime(0)).toBe("< 1 min read");
    });

    it("should handle large numbers", () => {
      expect(formatReadingTime(100)).toBe("100 min read");
    });
  });

  describe("Content Reading Time", () => {
    it("should get reading time from content", () => {
      const content = Array(200).fill("word").join(" ");
      const readingTime = getReadingTimeFromContent(content);
      expect(readingTime).toBe(1);
    });

    it("should handle empty content", () => {
      expect(getReadingTimeFromContent("")).toBe(1);
    });

    it("should calculate for typical article", () => {
      const content = Array(1000).fill("word").join(" ");
      expect(getReadingTimeFromContent(content)).toBe(5);
    });
  });

  describe("Article Schema Generation", () => {
    it("should generate basic article schema", () => {
      const data = {
        headline: "Test Article",
        description: "A test article",
        url: "https://example.com/article",
        datePublished: "2024-01-01",
        author: {
          name: "John Doe",
        },
      };

      const schema = generateArticleSchema(data);

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("BlogPosting");
      expect(schema.headline).toBe("Test Article");
      expect(schema.description).toBe("A test article");
      expect(schema.url).toBe("https://example.com/article");
      expect(schema.datePublished).toBe("2024-01-01");
      expect(schema.author.name).toBe("John Doe");
    });

    it("should include image when provided", () => {
      const data = {
        headline: "Test Article",
        description: "A test article",
        url: "https://example.com/article",
        image: "https://example.com/image.jpg",
        datePublished: "2024-01-01",
        author: {
          name: "John Doe",
        },
      };

      const schema = generateArticleSchema(data);
      expect(schema.image).toBe("https://example.com/image.jpg");
    });

    it("should include dateModified when provided", () => {
      const data = {
        headline: "Test Article",
        description: "A test article",
        url: "https://example.com/article",
        datePublished: "2024-01-01",
        dateModified: "2024-01-15",
        author: {
          name: "John Doe",
        },
      };

      const schema = generateArticleSchema(data);
      expect(schema.dateModified).toBe("2024-01-15");
    });

    it("should include word count and reading time", () => {
      const content = Array(1000).fill("word").join(" ");
      const data = {
        headline: "Test Article",
        description: "A test article",
        url: "https://example.com/article",
        datePublished: "2024-01-01",
        author: {
          name: "John Doe",
        },
        wordCount: countWords(content),
      };

      const schema = generateArticleSchema(data);
      expect(schema.wordCount).toBe(1000);
      expect(schema.timeRequired).toBe("PT5M");
    });

    it("should include keywords when provided", () => {
      const data = {
        headline: "Test Article",
        description: "A test article",
        url: "https://example.com/article",
        datePublished: "2024-01-01",
        author: {
          name: "John Doe",
        },
        keywords: ["BIM", "MEPF", "design"],
      };

      const schema = generateArticleSchema(data);
      expect(schema.keywords).toBe("BIM, MEPF, design");
    });

    it("should include provider information when provided", () => {
      const data = {
        headline: "Test Article",
        description: "A test article",
        url: "https://example.com/article",
        datePublished: "2024-01-01",
        author: {
          name: "John Doe",
        },
        provider: {
          name: "IMI Design",
          url: "https://imidesign.in",
        },
      };

      const schema = generateArticleSchema(data);
      expect(schema.provider.name).toBe("IMI Design");
      expect(schema.provider.url).toBe("https://imidesign.in");
    });

    it("should handle missing optional fields", () => {
      const data = {
        headline: "Test Article",
        description: "A test article",
        url: "https://example.com/article",
        datePublished: "2024-01-01",
        author: {
          name: "John Doe",
        },
      };

      const schema = generateArticleSchema(data);
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("BlogPosting");
    });
  });

  describe("Date Formatting", () => {
    it("should format date to ISO 8601", () => {
      const date = new Date("2024-01-15");
      expect(formatDateToISO(date)).toBe("2024-01-15");
    });

    it("should format string date to ISO 8601", () => {
      expect(formatDateToISO("2024-01-15")).toBe("2024-01-15");
    });

    it("should handle various date formats", () => {
      const result = formatDateToISO("January 15, 2024");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long articles", () => {
      const content = Array(10000).fill("word").join(" ");
      const readingTime = getReadingTimeFromContent(content);
      expect(readingTime).toBe(50);
    });

    it("should handle articles with special characters", () => {
      const content = "Hello @world! #test $special ^characters & symbols";
      const wordCount = countWords(content);
      expect(wordCount).toBeGreaterThan(0);
    });

    it("should handle articles with code blocks", () => {
      const content = `
        Here is some text.
        \`\`\`
        const code = "example";
        \`\`\`
        More text here.
      `;
      const wordCount = countWords(content);
      expect(wordCount).toBeGreaterThan(0);
    });

    it("should handle articles with markdown", () => {
      const content = `
        # Heading
        ## Subheading
        
        This is **bold** and *italic* text.
        
        - List item 1
        - List item 2
      `;
      const wordCount = countWords(content);
      expect(wordCount).toBeGreaterThan(0);
    });

    it("should handle schema with all optional fields", () => {
      const data = {
        headline: "Complete Article",
        description: "A complete article with all fields",
        url: "https://example.com/article",
        image: "https://example.com/image.jpg",
        datePublished: "2024-01-01",
        dateModified: "2024-01-15",
        author: {
          name: "John Doe",
          url: "https://example.com/author",
        },
        provider: {
          name: "IMI Design",
          url: "https://imidesign.in",
          logo: {
            url: "https://imidesign.in/logo.png",
            width: 300,
            height: 300,
          },
        },
        wordCount: 1000,
        readingTime: 5,
        keywords: ["BIM", "MEPF", "design"],
      };

      const schema = generateArticleSchema(data);
      expect(schema.headline).toBe("Complete Article");
      expect(schema.image).toBe("https://example.com/image.jpg");
      expect(schema.dateModified).toBe("2024-01-15");
      expect(schema.wordCount).toBe(1000);
      expect(schema.timeRequired).toBe("PT5M");
    });
  });

  describe("SEO Benefits", () => {
    it("should generate valid BlogPosting schema", () => {
      const data = {
        headline: "BIM Design Best Practices",
        description: "Learn best practices for BIM design",
        url: "https://imidesign.in/blog/bim-best-practices",
        image: "https://imidesign.in/images/bim.jpg",
        datePublished: "2024-01-01",
        author: {
          name: "IMI Design",
        },
        wordCount: 1500,
        readingTime: 7,
        keywords: ["BIM", "design", "best practices"],
      };

      const schema = generateArticleSchema(data);

      // Verify schema structure for Google Rich Results
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("BlogPosting");
      expect(schema.headline).toBeDefined();
      expect(schema.description).toBeDefined();
      expect(schema.image).toBeDefined();
      expect(schema.datePublished).toBeDefined();
      expect(schema.author).toBeDefined();
      expect(schema.wordCount).toBeDefined();
      expect(schema.timeRequired).toBeDefined();
    });

    it("should include all fields for rich snippets", () => {
      const data = {
        headline: "MEPF Coordination Guide",
        description: "Complete guide to MEPF coordination",
        url: "https://imidesign.in/blog/mepf-guide",
        image: "https://imidesign.in/images/mepf.jpg",
        datePublished: "2024-02-01",
        dateModified: "2024-02-15",
        author: {
          name: "IMI Design Team",
        },
        wordCount: 2000,
        readingTime: 10,
      };

      const schema = generateArticleSchema(data);

      // All fields should be present for rich snippets
      expect(Object.keys(schema).length).toBeGreaterThan(8);
    });
  });
});
