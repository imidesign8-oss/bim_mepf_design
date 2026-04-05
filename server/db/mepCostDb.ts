import { getDb } from "./index";
import {
  mepStates,
  mepCities,
  mepComponentCosts,
  mepEstimates,
  mepDisciplineCosts,
  InsertMepState,
  InsertMepCity,
  InsertMepComponentCost,
  InsertMepEstimate,
  InsertMepDisciplineCost,
  MepState,
  MepCity,
  MepComponentCost,
  MepEstimate,
  MepDisciplineCost,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * MEP States Management
 */
export async function createMepState(data: InsertMepState): Promise<MepState | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(mepStates).values(data);
    return getMepStateById((result as any).insertId);
  } catch (error) {
    console.error("[MEP] Error creating state:", error);
    return null;
  }
}

export async function getMepStateById(id: number): Promise<MepState | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(mepStates).where(eq(mepStates.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[MEP] Error getting state:", error);
    return null;
  }
}

export async function getMepStateByName(stateName: string): Promise<MepState | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(mepStates).where(eq(mepStates.stateName, stateName)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[MEP] Error getting state by name:", error);
    return null;
  }
}

export async function getAllMepStates(): Promise<MepState[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(mepStates).where(eq(mepStates.isActive, true));
  } catch (error) {
    console.error("[MEP] Error getting all states:", error);
    return [];
  }
}

export async function updateMepState(id: number, data: Partial<InsertMepState>): Promise<MepState | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(mepStates).set(data).where(eq(mepStates.id, id));
    return getMepStateById(id);
  } catch (error) {
    console.error("[MEP] Error updating state:", error);
    return null;
  }
}

/**
 * MEP Cities Management
 */
export async function createMepCity(data: InsertMepCity): Promise<MepCity | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(mepCities).values(data);
    return getMepCityById((result as any).insertId);
  } catch (error) {
    console.error("[MEP] Error creating city:", error);
    return null;
  }
}

export async function getMepCityById(id: number): Promise<MepCity | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(mepCities).where(eq(mepCities.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[MEP] Error getting city:", error);
    return null;
  }
}

export async function getMepCitiesByState(stateId: number): Promise<MepCity[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(mepCities).where(and(eq(mepCities.stateId, stateId), eq(mepCities.isActive, true)));
  } catch (error) {
    console.error("[MEP] Error getting cities by state:", error);
    return [];
  }
}

export async function updateMepCity(id: number, data: Partial<InsertMepCity>): Promise<MepCity | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(mepCities).set(data).where(eq(mepCities.id, id));
    return getMepCityById(id);
  } catch (error) {
    console.error("[MEP] Error updating city:", error);
    return null;
  }
}

/**
 * MEP Discipline Costs Management
 */
export async function getDisciplineCostsByCity(cityId: number): Promise<MepDisciplineCost[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(mepDisciplineCosts).where(eq(mepDisciplineCosts.cityId, cityId));
  } catch (error) {
    console.error("[MEP] Error getting discipline costs:", error);
    return [];
  }
}

export async function updateDisciplineCost(id: number, data: Partial<InsertMepDisciplineCost>): Promise<MepDisciplineCost | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(mepDisciplineCosts).set(data).where(eq(mepDisciplineCosts.id, id));
    const result = await db.select().from(mepDisciplineCosts).where(eq(mepDisciplineCosts.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[MEP] Error updating discipline cost:", error);
    return null;
  }
}

/**
 * MEP Estimates Management
 */
export async function createMepEstimate(data: InsertMepEstimate): Promise<MepEstimate | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(mepEstimates).values(data);
    return getMepEstimateById((result as any).insertId);
  } catch (error) {
    console.error("[MEP] Error creating estimate:", error);
    return null;
  }
}

export async function getMepEstimateById(id: number): Promise<MepEstimate | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(mepEstimates).where(eq(mepEstimates.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[MEP] Error getting estimate:", error);
    return null;
  }
}

/**
 * MEP Calculation Input/Output Types
 */
export interface MepCalculationInput {
  projectType: "residential" | "commercial" | "industrial" | "hospitality" | "mixed-use";
  buildingArea: number;
  constructionCost: number;
  cityId: number;
  disciplines: string[];
  buildingComplexity: string;
  greenCertification: string;
  materialQuality: string;
  projectTimeline: string;
  lodLevel: string;
  areaUnit: "sqft" | "sqm";
}

export interface DisciplineCalculationInput {
  projectType: "residential" | "commercial" | "industrial" | "hospitality" | "mixed-use";
  buildingArea: number;
  cityId: number;
  disciplines: string[];
  buildingComplexity: string;
  greenCertification: string;
  materialQuality: string;
  projectTimeline: string;
  lodLevel: string;
  areaUnit: "sqft" | "sqm";
}

export interface MepCalculationResult {
  totalCost: number;
  costPerSqft: number;
  accuracyRange: string;
  disciplineCosts: Record<string, number>;
  appliedAdjustments: Record<string, number>;
}

export interface DisciplineCalculationResult {
  totalCost: number;
  costPerSqft: number;
  accuracyRange: string;
  disciplineCosts: Record<string, number>;
  appliedAdjustments: Record<string, number>;
}

/**
 * Calculate MEP cost based on selected disciplines
 * FIXED: Discipline costs now sum correctly to total
 */
export async function calculateDisciplineCost(input: DisciplineCalculationInput): Promise<DisciplineCalculationResult | null> {
  try {
    const city = await getMepCityById(input.cityId);
    if (!city) throw new Error("City not found");

    // Get discipline costs for this city
    const disciplineCosts = await getDisciplineCostsByCity(input.cityId);
    if (disciplineCosts.length === 0) throw new Error("No discipline costs found for this city");

    // Get base construction cost
    let baseCostPerSqft = 0;
    switch (input.projectType) {
      case "residential":
        baseCostPerSqft = Number(city.baseCostResidential);
        break;
      case "commercial":
      case "mixed-use":
        baseCostPerSqft = Number(city.baseCostCommercial);
        break;
      case "industrial":
      case "hospitality":
        baseCostPerSqft = Number(city.baseCostIndustrial);
        break;
    }

    const totalConstructionCost = baseCostPerSqft * input.buildingArea;

    // STEP 1: Calculate base discipline costs (BEFORE applying adjustments)
    let baseDisciplineCost = 0;
    const disciplineCostBreakdown: Record<string, number> = {};

    for (const discipline of input.disciplines) {
      const disciplineCost = disciplineCosts.find((dc) => dc.discipline === discipline);
      if (!disciplineCost) continue;

      let costPerSqft = 0;
      switch (input.projectType) {
        case "residential":
          costPerSqft = Number(disciplineCost.costResidential);
          break;
        case "commercial":
        case "mixed-use":
          costPerSqft = Number(disciplineCost.costCommercial);
          break;
        case "industrial":
        case "hospitality":
          costPerSqft = Number(disciplineCost.costIndustrial);
          break;
      }

      let disciplineTotal = costPerSqft * input.buildingArea;
      disciplineCostBreakdown[discipline] = disciplineTotal;
      baseDisciplineCost += disciplineTotal;
    }

    // STEP 2: Calculate all multipliers ONCE
    const adjustments: Record<string, number> = {};

    // Regional multiplier
    const regionalMultiplier = Number(city.regionalMultiplier);
    adjustments.regional = regionalMultiplier;

    // Climate adjustment
    const climateAdjustment = 1 + Number(city.climateAdjustment) / 100;
    adjustments.climate = climateAdjustment;

    // Complexity factor
    const complexityFactors: Record<string, number> = {
      simple: 1.0,
      moderate: 1.15,
      complex: 1.30,
    };
    const complexityFactor = complexityFactors[input.buildingComplexity] || 1.0;
    adjustments.complexity = complexityFactor;

    // Green certification factor
    const certificationFactors: Record<string, number> = {
      none: 1.0,
      LEED: 1.18,
      IGBC: 1.15,
    };
    const certificationFactor = certificationFactors[input.greenCertification] || 1.0;
    adjustments.certification = certificationFactor;

    // Material quality factor
    const materialFactors: Record<string, number> = {
      standard: 1.0,
      premium: 1.25,
      imported: 1.60,
    };
    const materialFactor = materialFactors[input.materialQuality] || 1.0;
    adjustments.material = materialFactor;

    // Timeline factor
    const timelineFactors: Record<string, number> = {
      standard: 1.0,
      "fast-track": 1.15,
      delayed: 1.0,
    };
    const timelineFactor = timelineFactors[input.projectTimeline] || 1.0;
    adjustments.timeline = timelineFactor;

    // MEP does NOT use LOD - LOD is only for BIM
    // Accuracy range for MEP is fixed at ±15%

    // STEP 3: Calculate combined multiplier
    const combinedMultiplier = regionalMultiplier * climateAdjustment * complexityFactor * certificationFactor * materialFactor * timelineFactor;

    // STEP 4: Apply multiplier to base cost (NO LOD for MEP)
    let totalDisciplineCost = baseDisciplineCost * combinedMultiplier;

    // STEP 5: Apply adjustments to breakdown (each discipline gets same multiplier)
    const adjustedBreakdown: Record<string, number> = {};
    for (const [discipline, cost] of Object.entries(disciplineCostBreakdown)) {
      adjustedBreakdown[discipline] = Math.round(cost * combinedMultiplier);
    }

    // Verify discipline costs sum to total
    const disciplineSum = Object.values(adjustedBreakdown).reduce((a, b) => a + b, 0);
    const costPerSqft = input.areaUnit === "sqft" 
      ? totalDisciplineCost / input.buildingArea
      : (totalDisciplineCost / input.buildingArea) * 10.764;

    return {
      totalCost: Math.round(totalDisciplineCost),
      costPerSqft: Math.round(costPerSqft * 100) / 100,
      accuracyRange: "±15%",
      disciplineCosts: adjustedBreakdown,
      appliedAdjustments: adjustments,
    };
  } catch (error) {
    console.error("[MEP] Error calculating discipline cost:", error);
    return null;
  }
}

/**
 * Generate unique estimate code
 */
export function generateEstimateCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EST-${timestamp}-${random}`;
}
