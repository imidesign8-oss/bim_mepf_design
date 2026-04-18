import { getDb } from "../db";
import { quoteRequests, quotePricingRules } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { getActiveMockPricingRule, createMockQuoteRequest, getMockQuoteRequest, updateMockQuoteRequest } from "../mockDb";

export interface QuestionnaireResponse {
  projectName: string;
  projectType: "residential" | "commercial" | "industrial" | "hospitality" | "mixed-use";
  buildingArea: number; // in sq ft
  complexity: "simple" | "moderate" | "complex";
  timeline: "standard" | "fast-track";
  disciplines: string[]; // e.g., ["MEP", "BIM", "Structural"]
  numberOfFloors: number;
  hasExistingModels: boolean;
  coordinationRequired: boolean;
  additionalServices: string[];
}

/**
 * Generate unique quote code
 */
export function generateQuoteCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `QT-${timestamp}-${random}`;
}

/**
 * Calculate quote amount based on questionnaire and pricing rules
 */
export async function calculateQuoteAmount(
  questionnaire: QuestionnaireResponse
): Promise<{ amount: number; breakdown: Record<string, number> }> {
  let rule: any = null;
  
  // Try to get pricing rules from database
  const db = await getDb();
  if (db) {
    try {
      const rules = await db
        .select()
        .from(quotePricingRules)
        .where(eq(quotePricingRules.isActive, true));
      if (rules && rules.length > 0) {
        rule = rules[0];
      }
    } catch (error) {
      console.warn('[QuoteGenerator] Database query failed, using mock data:', error);
    }
  }
  
  // Fallback to mock database
  if (!rule) {
    rule = getActiveMockPricingRule();
    console.log('[QuoteGenerator] Using mock pricing rule');
  }

  if (!rule) {
    // Default pricing if no rules exist
    return {
      amount: 50000, // Default base amount
      breakdown: { base: 50000 },
    };
  }

  let breakdown: Record<string, number> = {};

  // Base price
  let basePrice = Number(rule.basePrice) || 50000;
  breakdown.base = basePrice;

  // Area-based pricing
  if (rule.pricePerSqft) {
    const areaCost = questionnaire.buildingArea * Number(rule.pricePerSqft);
    breakdown.area = areaCost;
    basePrice += areaCost;
  }

  // Complexity multiplier
  let complexityMultiplier = 1.0;
  if (questionnaire.complexity === "simple") {
    complexityMultiplier = Number(rule.simpleMultiplier) || 1.0;
  } else if (questionnaire.complexity === "moderate") {
    complexityMultiplier = Number(rule.moderateMultiplier) || 1.2;
  } else if (questionnaire.complexity === "complex") {
    complexityMultiplier = Number(rule.complexMultiplier) || 1.5;
  }
  breakdown.complexity = basePrice * (complexityMultiplier - 1);
  basePrice *= complexityMultiplier;

  // Timeline multiplier
  let timelineMultiplier = 1.0;
  if (questionnaire.timeline === "standard") {
    timelineMultiplier = Number(rule.standardTimelineMultiplier) || 1.0;
  } else if (questionnaire.timeline === "fast-track") {
    timelineMultiplier = Number(rule.fastTrackMultiplier) || 1.3;
  }
  breakdown.timeline = basePrice * (timelineMultiplier - 1);
  basePrice *= timelineMultiplier;

  // Additional services multiplier
  if (questionnaire.additionalServices.length > 0) {
    const additionalCost = basePrice * 0.1 * questionnaire.additionalServices.length;
    breakdown.additionalServices = additionalCost;
    basePrice += additionalCost;
  }

  // Coordination premium
  if (questionnaire.coordinationRequired) {
    const coordCost = basePrice * 0.15;
    breakdown.coordination = coordCost;
    basePrice += coordCost;
  }

  // Round to nearest 1000
  const finalAmount = Math.round(basePrice / 1000) * 1000;

  return {
    amount: finalAmount,
    breakdown,
  };
}

/**
 * Create quote request
 */
export async function createQuoteRequest(
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  clientCompany: string,
  questionnaire: QuestionnaireResponse,
  quoteAmount: number
) {
  const quoteCode = generateQuoteCode();
  const quoteValidUntil = new Date();
  quoteValidUntil.setDate(quoteValidUntil.getDate() + 30); // Valid for 30 days

  const quoteData = {
    quoteCode,
    clientName,
    clientEmail,
    clientPhone: clientPhone || "",
    clientCompany: clientCompany || "",
    questionnaireResponses: JSON.stringify(questionnaire),
    quoteAmount: quoteAmount.toString(),
    currency: "INR",
    quoteValidityDays: 30,
    quoteValidUntil: quoteValidUntil || new Date(),
    status: "generated",
    emailsSent: 0,
  };

  try {
    console.log("Creating quote with:", {
      quoteCode,
      clientName,
      clientEmail,
      quoteAmount: quoteAmount.toString(),
    });

    // Try to save to database
    const db = await getDb();
    if (db) {
      try {
        await db.insert(quoteRequests).values(quoteData as any);
        console.log("Quote created successfully in database:", quoteCode);
      } catch (dbError) {
        console.warn('[QuoteGenerator] Database insert failed, using mock storage:', dbError);
        // Fall back to mock database
        createMockQuoteRequest(quoteData);
      }
    } else {
      // Use mock database
      createMockQuoteRequest(quoteData);
      console.log('[QuoteGenerator] Created quote in mock storage:', quoteCode);
    }

    return { quoteCode, quoteValidUntil };
  } catch (error: any) {
    console.error("Error creating quote request:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      sql: error.sql,
      stack: error.stack,
    });
    throw new Error(`Failed to create quote request: ${error.sqlMessage || error.message || 'Unknown error'}`);
  }
}

/**
 * Get quote by code
 */
export async function getQuoteByCode(quoteCode: string) {
  const db = await getDb();
  
  let quote: any = null;

  // Try database first
  if (db) {
    try {
      const quotes = await db
        .select()
        .from(quoteRequests)
        .where(eq(quoteRequests.quoteCode, quoteCode));

      if (quotes && quotes.length > 0) {
        quote = quotes[0];
      }
    } catch (error) {
      console.warn('[QuoteGenerator] Database query failed, checking mock storage:', error);
    }
  }

  // Fall back to mock database
  if (!quote) {
    quote = getMockQuoteRequest(parseInt(quoteCode.split('-')[0]) || 0);
  }

  if (!quote) return null;

  return {
    ...quote,
    questionnaireResponses: typeof quote.questionnaireResponses === 'string' 
      ? JSON.parse(quote.questionnaireResponses)
      : quote.questionnaireResponses,
  };
}

/**
 * Update quote status
 */
export async function updateQuoteStatus(
  quoteCode: string,
  status: "sent" | "viewed" | "accepted" | "rejected" | "expired"
) {
  const db = await getDb();

  const updateData: Record<string, any> = { status };

  if (status === "sent") {
    updateData.sentDate = new Date();
  } else if (status === "viewed") {
    updateData.viewedDate = new Date();
  } else if (status === "accepted") {
    updateData.acceptedDate = new Date();
  } else if (status === "rejected") {
    updateData.rejectedDate = new Date();
  }

  try {
    // Try database first
    if (db) {
      try {
        await db
          .update(quoteRequests)
          .set(updateData)
          .where(eq(quoteRequests.quoteCode, quoteCode));
        return true;
      } catch (dbError) {
        console.warn('[QuoteGenerator] Database update failed, using mock storage:', dbError);
      }
    }

    // Fall back to mock database
    const mockQuote = getMockQuoteRequest(parseInt(quoteCode.split('-')[0]) || 0);
    if (mockQuote) {
      updateMockQuoteRequest(mockQuote.id, updateData);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error updating quote status:", error);
    return false;
  }
}
