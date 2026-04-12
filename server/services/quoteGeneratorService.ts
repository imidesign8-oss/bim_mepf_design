import { getDb } from "../db";
import { quoteRequests, quotePricingRules } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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
  const db = await getDb();
  if (!db) {
    return { amount: 0, breakdown: {} };
  }

  // Get active pricing rules
  const rules = await db
    .select()
    .from(quotePricingRules)
    .where(eq(quotePricingRules.isActive, true));

  if (!rules || rules.length === 0) {
    // Default pricing if no rules exist
    return {
      amount: 50000, // Default base amount
      breakdown: { base: 50000 },
    };
  }

  const rule = rules[0];
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
  const db = await getDb();
  if (!db) return null;

  const quoteCode = generateQuoteCode();
  const quoteValidUntil = new Date();
  quoteValidUntil.setDate(quoteValidUntil.getDate() + 30); // Valid for 30 days

  try {
    const result = await db.insert(quoteRequests).values({
      quoteCode,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      questionnaireResponses: JSON.stringify(questionnaire),
      quoteAmount: quoteAmount.toString(),
      currency: "INR",
      quoteValidityDays: 30,
      quoteValidUntil,
      status: "generated",
    });

    return { quoteCode, quoteValidUntil };
  } catch (error) {
    console.error("Error creating quote request:", error);
    return null;
  }
}

/**
 * Get quote by code
 */
export async function getQuoteByCode(quoteCode: string) {
  const db = await getDb();
  if (!db) return null;

  const quotes = await db
    .select()
    .from(quoteRequests)
    .where(eq(quoteRequests.quoteCode, quoteCode));

  if (!quotes || quotes.length === 0) return null;

  const quote = quotes[0];
  return {
    ...quote,
    questionnaireResponses: JSON.parse(quote.questionnaireResponses),
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
  if (!db) return null;

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
    await db
      .update(quoteRequests)
      .set(updateData)
      .where(eq(quoteRequests.quoteCode, quoteCode));

    return true;
  } catch (error) {
    console.error("Error updating quote status:", error);
    return false;
  }
}
