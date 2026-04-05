/**
 * MEP and BIM Cost Calculation Engine
 * 
 * MEP Model: 1-2% of construction cost with discipline weightage
 * BIM Model: 4-10% of project cost based on LOD level
 */

import { getDb } from "./index";
import { mepCostRange, mepDisciplineWeightage, bimLodPricing } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface MepCalculationInput {
  constructionCost: number; // Total construction cost
  projectType: "residential" | "commercial" | "industrial" | "hospitality" | "mixed-use";
  cityId: number;
  selectedDisciplines: ("electrical" | "plumbing" | "hvac" | "fire-system")[];
  areaUnit: "sqft" | "sqm";
  buildingArea: number;
}

export interface BimCalculationInput {
  projectCost: number; // Total project cost
  projectType: "residential" | "commercial" | "industrial" | "hospitality" | "mixed-use";
  cityId: number;
  lodLevel: "100" | "200" | "300" | "400" | "500";
  areaUnit: "sqft" | "sqm";
  buildingArea: number;
}

export interface MepCalculationResult {
  baseMepCost: number;
  mepPercentage: number;
  disciplineBreakdown: Record<string, { cost: number; percentage: number; weightage: number }>;
  totalMepCost: number;
  costPerUnit: number;
  accuracyRange: string;
}

export interface BimCalculationResult {
  baseBimCost: number;
  bimPercentage: number;
  lodLevel: string;
  totalBimCost: number;
  costPerUnit: number;
  accuracyRange: string;
}

/**
 * Calculate MEP cost based on construction cost and selected disciplines
 * Formula: MEP Cost = Construction Cost × MEP % × Discipline Weightage
 * NO LOD for MEP - accuracy is fixed at ±15%
 */
export async function calculateMepCost(input: MepCalculationInput): Promise<MepCalculationResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get MEP cost range for project type
  const costRange = await db
    .select()
    .from(mepCostRange)
    .where(eq(mepCostRange.projectType, input.projectType))
    .limit(1);

  if (!costRange.length) {
    throw new Error(`No MEP cost range found for project type: ${input.projectType}`);
  }

  // MEP percentage is 1-2% of construction cost
  const mepPercentage = Number(costRange[0].defaultPercentage) / 100; // e.g., 1.5 -> 0.015
  const baseMepCost = input.constructionCost * mepPercentage;

  // Get discipline weightages
  const disciplineWeightages = await db
    .select()
    .from(mepDisciplineWeightage)
    .where(eq(mepDisciplineWeightage.isActive, true));

  const weightageMap = new Map(
    disciplineWeightages.map((d: any) => [d.discipline, Number(d.weightagePercentage) / 100])
  );

  // Calculate cost for each discipline
  // Show ALL 4 disciplines, but only charge for selected ones
  const disciplineBreakdown: Record<string, { cost: number; percentage: number; weightage: number }> = {};
  let totalDisciplineCost = 0;

  const allDisciplines: ("electrical" | "plumbing" | "hvac" | "fire-system")[] = [
    "electrical",
    "plumbing",
    "hvac",
    "fire-system",
  ];

  for (const discipline of allDisciplines) {
    const weightage = (weightageMap.get(discipline) || 0) as number;
    const disciplineCost = Math.round(baseMepCost * weightage);
    const isSelected = input.selectedDisciplines.includes(discipline);

    disciplineBreakdown[discipline] = {
      cost: isSelected ? disciplineCost : 0, // Only charge for selected
      percentage: weightage * 100,
      weightage: weightage,
    };

    if (isSelected) {
      totalDisciplineCost += disciplineCost;
    }
  }

  // Calculate cost per unit
  const costPerUnit = input.buildingArea > 0
    ? totalDisciplineCost / input.buildingArea
    : 0;

  return {
    baseMepCost: Math.round(baseMepCost),
    mepPercentage: Number(costRange[0].defaultPercentage),
    disciplineBreakdown,
    totalMepCost: totalDisciplineCost,
    costPerUnit: Math.round(costPerUnit * 100) / 100,
    accuracyRange: "±15%", // Fixed for MEP - NO LOD
  };
}

/**
 * Calculate BIM cost based on project cost and LOD level
 * Formula: BIM Cost = Project Cost × BIM % (based on LOD)
 * LOD determines accuracy and percentage
 */
export async function calculateBimCost(input: BimCalculationInput): Promise<BimCalculationResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get BIM LOD pricing for city
  const bimPricing = await db
    .select()
    .from(bimLodPricing)
    .where(
      and(
        eq(bimLodPricing.cityId, input.cityId),
        eq(bimLodPricing.lodLevel, input.lodLevel),
        eq(bimLodPricing.isActive, true)
      )
    )
    .limit(1);

  if (!bimPricing.length) {
    throw new Error(`No BIM LOD pricing found for city ${input.cityId} and LOD ${input.lodLevel}`);
  }

  const pricing = bimPricing[0];
  
  // Select appropriate percentage based on project type
  let bimPercentage = 0;
  switch (input.projectType) {
    case "residential":
      bimPercentage = Number(pricing.bimPercentageResidential) / 100;
      break;
    case "commercial":
    case "hospitality":
    case "mixed-use":
      bimPercentage = Number(pricing.bimPercentageCommercial) / 100;
      break;
    case "industrial":
      bimPercentage = Number(pricing.bimPercentageIndustrial) / 100;
      break;
  }

  const baseBimCost = Math.round(input.projectCost * bimPercentage);

  // Calculate cost per unit
  const costPerUnit = input.buildingArea > 0
    ? baseBimCost / input.buildingArea
    : 0;

  // Accuracy range based on LOD level
  const accuracyRanges: Record<string, string> = {
    "100": "±30%",
    "200": "±20%",
    "300": "±10%",
    "400": "±5%",
    "500": "±0%",
  };

  return {
    baseBimCost,
    bimPercentage: bimPercentage * 100,
    lodLevel: input.lodLevel,
    totalBimCost: baseBimCost,
    costPerUnit: Math.round(costPerUnit * 100) / 100,
    accuracyRange: accuracyRanges[input.lodLevel] || "±15%",
  };
}
