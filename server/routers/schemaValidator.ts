import { publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  validateJsonLd,
  validateMultipleJsonLd,
  getValidationSummary,
} from "../utils/schemaValidator";
import type { ValidationResult } from "../utils/schemaValidator";

export const schemaValidatorRouter = {
  validateSchema: publicProcedure
    .input(
      z.object({
        jsonLd: z.string().describe("JSON-LD markup to validate"),
      })
    )
    .mutation(({ input }: { input: { jsonLd: string } }) => {
      const result = validateJsonLd(input.jsonLd);
      return {
        ...result,
        summary: getValidationSummary(result),
      };
    }),

  validateMultiple: publicProcedure
    .input(
      z.object({
        jsonLdStrings: z.array(z.string()).describe("Array of JSON-LD strings to validate"),
      })
    )
    .mutation(({ input }: { input: { jsonLdStrings: string[] } }) => {
      const results = validateMultipleJsonLd(input.jsonLdStrings);
      return {
        results,
        summaries: results.map((r: any) => getValidationSummary(r)),
        totalValid: results.filter((r: any) => r.valid).length,
        totalErrors: results.reduce((sum: number, r: any) => sum + r.errors.length, 0),
        totalWarnings: results.reduce((sum: number, r: any) => sum + r.warnings.length, 0),
      };
    }),

  validatePageSchema: publicProcedure
    .input(
      z.object({
        pageType: z.enum(["home", "about", "services", "projects", "blog", "contact", "global"]),
        jsonLd: z.string(),
      })
    )
    .mutation(({ input }: { input: { pageType: string; jsonLd: string } }) => {
      const result = validateJsonLd(input.jsonLd);

      // Add page-specific recommendations
      const recommendations = getPageRecommendations(input.pageType, result);

      return {
        ...result,
        summary: getValidationSummary(result),
        pageType: input.pageType,
        recommendations,
      };
    }),
};

/**
 * Get page-specific schema recommendations
 */
function getPageRecommendations(
  pageType: string,
  result: any
): Array<{ type: string; message: string }> {
  const recommendations: Array<{ type: string; message: string }> = [];

  switch (pageType) {
    case "home":
      if (result.schemaType !== "Organization" && result.schemaType !== "LocalBusiness") {
        recommendations.push({
          type: "info",
          message: "Home page should use Organization or LocalBusiness schema",
        });
      }
      break;

    case "blog":
      if (result.schemaType !== "Article") {
        recommendations.push({
          type: "info",
          message: "Blog posts should use Article schema for better search visibility",
        });
      }
      break;

    case "services":
      if (result.schemaType !== "Service") {
        recommendations.push({
          type: "info",
          message: "Service pages should use Service schema to display in rich results",
        });
      }
      break;

    case "projects":
      if (result.schemaType !== "CreativeWork") {
        recommendations.push({
          type: "info",
          message: "Project pages should use CreativeWork or Project schema",
        });
      }
      break;

    case "contact":
      recommendations.push({
        type: "info",
        message: "Contact pages should include Organization schema with contact details",
      });
      break;
  }

  return recommendations;
}
