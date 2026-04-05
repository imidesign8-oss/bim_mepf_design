import { getDb } from "../db";
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
    return await db.select().from(mepCities).where(
      and(eq(mepCities.stateId, stateId), eq(mepCities.isActive, true))
    );
  } catch (error) {
    console.error("[MEP] Error getting cities by state:", error);
    return [];
  }
}

export async function getAllMepCities(): Promise<MepCity[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(mepCities).where(eq(mepCities.isActive, true));
  } catch (error) {
    console.error("[MEP] Error getting all cities:", error);
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
 * MEP Component Costs Management
 */
export async function createMepComponentCost(data: InsertMepComponentCost): Promise<MepComponentCost | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(mepComponentCosts).values(data);
    return getMepComponentCostById((result as any).insertId);
  } catch (error) {
    console.error("[MEP] Error creating component cost:", error);
    return null;
  }
}

export async function getMepComponentCostById(id: number): Promise<MepComponentCost | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(mepComponentCosts).where(eq(mepComponentCosts.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[MEP] Error getting component cost:", error);
    return null;
  }
}

export async function getMepComponentCostsByType(componentType: string): Promise<MepComponentCost[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(mepComponentCosts).where(
      and(eq(mepComponentCosts.componentType, componentType as any), eq(mepComponentCosts.isActive, true))
    );
  } catch (error) {
    console.error("[MEP] Error getting component costs by type:", error);
    return [];
  }
}

export async function getAllMepComponentCosts(): Promise<MepComponentCost[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(mepComponentCosts).where(eq(mepComponentCosts.isActive, true));
  } catch (error) {
    console.error("[MEP] Error getting all component costs:", error);
    return [];
  }
}

export async function updateMepComponentCost(id: number, data: Partial<InsertMepComponentCost>): Promise<MepComponentCost | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(mepComponentCosts).set(data).where(eq(mepComponentCosts.id, id));
    return getMepComponentCostById(id);
  } catch (error) {
    console.error("[MEP] Error updating component cost:", error);
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

export async function getMepEstimateByCode(estimateCode: string): Promise<MepEstimate | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(mepEstimates).where(eq(mepEstimates.estimateCode, estimateCode)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[MEP] Error getting estimate by code:", error);
    return null;
  }
}

export async function getMepEstimatesByUser(userId: number): Promise<MepEstimate[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(mepEstimates).where(eq(mepEstimates.userId, userId));
  } catch (error) {
    console.error("[MEP] Error getting estimates by user:", error);
    return [];
  }
}

export async function getAllMepEstimates(): Promise<MepEstimate[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(mepEstimates).where(eq(mepEstimates.isPublic, true));
  } catch (error) {
    console.error("[MEP] Error getting all estimates:", error);
    return [];
  }
}

export async function updateMepEstimate(id: number, data: Partial<InsertMepEstimate>): Promise<MepEstimate | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(mepEstimates).set(data).where(eq(mepEstimates.id, id));
    return getMepEstimateById(id);
  } catch (error) {
    console.error("[MEP] Error updating estimate:", error);
    return null;
  }
}

/**
 * MEP Cost Calculation Helper
 */
export interface MepCalculationInput {
  projectType: "residential" | "commercial" | "industrial" | "hospitality" | "mixed-use";
  buildingArea: number;
  cityId: number;
  buildingComplexity: "simple" | "moderate" | "complex";
  greenCertification: "none" | "LEED" | "IGBC";
  materialQuality: "standard" | "premium" | "imported";
  projectTimeline: "standard" | "fast-track" | "delayed";
  lodLevel: "100" | "200" | "300" | "350" | "400" | "500";
}

export interface MepCalculationResult {
  baseMepCost: number;
  adjustedMepCost: number;
  costPerSqft: number;
  accuracyRange: string;
  mechanicalCost: number;
  electricalCost: number;
  plumbingCost: number;
  fireSafetyCost: number;
  smartSystemsCost: number;
  appliedAdjustments: Record<string, number>;
}

export async function calculateMepCost(input: MepCalculationInput): Promise<MepCalculationResult | null> {
  try {
    const city = await getMepCityById(input.cityId);
    if (!city) throw new Error("City not found");

    // Get base construction cost based on project type
    let baseCostPerSqft = 0;
    let mepPercentage = 0;

    switch (input.projectType) {
      case "residential":
        baseCostPerSqft = Number(city.baseCostResidential);
        mepPercentage = Number(city.mepPercentageResidential);
        break;
      case "commercial":
      case "mixed-use":
        baseCostPerSqft = Number(city.baseCostCommercial);
        mepPercentage = Number(city.mepPercentageCommercial);
        break;
      case "industrial":
      case "hospitality":
        baseCostPerSqft = Number(city.baseCostIndustrial);
        mepPercentage = Number(city.mepPercentageIndustrial);
        break;
    }

    // Calculate base MEP cost
    const totalConstructionCost = baseCostPerSqft * input.buildingArea;
    let baseMepCost = (totalConstructionCost * mepPercentage) / 100;

    // Apply adjustments
    const adjustments: Record<string, number> = {};

    // Regional multiplier
    const regionalMultiplier = Number(city.regionalMultiplier);
    adjustments.regional = regionalMultiplier;
    baseMepCost *= regionalMultiplier;

    // Climate adjustment
    const climateAdjustment = 1 + Number(city.climateAdjustment) / 100;
    adjustments.climate = climateAdjustment;
    baseMepCost *= climateAdjustment;

    // Complexity factor
    const complexityFactors: Record<string, number> = {
      simple: 1.0,
      moderate: 1.15,
      complex: 1.30,
    };
    const complexityFactor = complexityFactors[input.buildingComplexity];
    adjustments.complexity = complexityFactor;
    baseMepCost *= complexityFactor;

    // Green certification factor
    const certificationFactors: Record<string, number> = {
      none: 1.0,
      LEED: 1.18,
      IGBC: 1.15,
    };
    const certificationFactor = certificationFactors[input.greenCertification];
    adjustments.certification = certificationFactor;
    baseMepCost *= certificationFactor;

    // Material quality factor
    const materialFactors: Record<string, number> = {
      standard: 1.0,
      premium: 1.25,
      imported: 1.60,
    };
    const materialFactor = materialFactors[input.materialQuality];
    adjustments.material = materialFactor;
    baseMepCost *= materialFactor;

    // Timeline factor
    const timelineFactors: Record<string, number> = {
      standard: 1.0,
      "fast-track": 1.15,
      delayed: 1.0,
    };
    const timelineFactor = timelineFactors[input.projectTimeline];
    adjustments.timeline = timelineFactor;
    baseMepCost *= timelineFactor;

    // LOD accuracy range
    const lodAccuracyRanges: Record<string, { min: number; max: number }> = {
      "100": { min: 30, max: 30 },
      "200": { min: 20, max: 20 },
      "300": { min: 15, max: 15 },
      "350": { min: 10, max: 10 },
      "400": { min: 5, max: 5 },
      "500": { min: 0, max: 0 },
    };
    const lodRange = lodAccuracyRanges[input.lodLevel];
    const lodAdjustment = 1 + lodRange.max / 100;
    adjustments.lod = lodAdjustment;

    const adjustedMepCost = baseMepCost * lodAdjustment;
    const costPerSqft = adjustedMepCost / input.buildingArea;

    // Component breakdown (approximate distribution)
    const mechanicalCost = adjustedMepCost * 0.40; // 40%
    const electricalCost = adjustedMepCost * 0.35; // 35%
    const plumbingCost = adjustedMepCost * 0.20; // 20%
    const fireSafetyCost = adjustedMepCost * 0.03; // 3%
    const smartSystemsCost = adjustedMepCost * 0.02; // 2%

    return {
      baseMepCost: Math.round(baseMepCost),
      adjustedMepCost: Math.round(adjustedMepCost),
      costPerSqft: Math.round(costPerSqft * 100) / 100,
      accuracyRange: `±${lodRange.max}%`,
      mechanicalCost: Math.round(mechanicalCost),
      electricalCost: Math.round(electricalCost),
      plumbingCost: Math.round(plumbingCost),
      fireSafetyCost: Math.round(fireSafetyCost),
      smartSystemsCost: Math.round(smartSystemsCost),
      appliedAdjustments: adjustments,
    };
  } catch (error) {
    console.error("[MEP] Error calculating cost:", error);
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
    return await db.select().from(mepDisciplineCosts).where(and(eq(mepDisciplineCosts.cityId, cityId), eq(mepDisciplineCosts.isActive, true)));
  } catch (error) {
    console.error("[MEP] Error getting discipline costs:", error);
    return [];
  }
}

export async function getDisciplineCost(cityId: number, discipline: string): Promise<MepDisciplineCost | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(mepDisciplineCosts).where(and(eq(mepDisciplineCosts.cityId, cityId), eq(mepDisciplineCosts.discipline, discipline as any), eq(mepDisciplineCosts.isActive, true))).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[MEP] Error getting discipline cost:", error);
    return null;
  }
}

export async function createDisciplineCost(data: InsertMepDisciplineCost): Promise<MepDisciplineCost | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(mepDisciplineCosts).values(data);
    const id = (result as any).insertId;
    return await getDisciplineCostById(id);
  } catch (error) {
    console.error("[MEP] Error creating discipline cost:", error);
    return null;
  }
}

export async function getDisciplineCostById(id: number): Promise<MepDisciplineCost | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(mepDisciplineCosts).where(eq(mepDisciplineCosts.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[MEP] Error getting discipline cost by id:", error);
    return null;
  }
}

export async function updateDisciplineCost(id: number, data: Partial<InsertMepDisciplineCost>): Promise<MepDisciplineCost | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(mepDisciplineCosts).set(data).where(eq(mepDisciplineCosts.id, id));
    return getDisciplineCostById(id);
  } catch (error) {
    console.error("[MEP] Error updating discipline cost:", error);
    return null;
  }
}

/**
 * Discipline-based calculation input
 */
export interface DisciplineCalculationInput {
  projectType: "residential" | "commercial" | "industrial" | "hospitality" | "mixed-use";
  buildingArea: number;
  cityId: number;
  disciplines: ("electrical" | "plumbing" | "hvac" | "fire-system")[];
  buildingComplexity: "simple" | "moderate" | "complex";
  greenCertification: "none" | "LEED" | "IGBC";
  materialQuality: "standard" | "premium" | "imported";
  projectTimeline: "standard" | "fast-track" | "delayed";
  lodLevel: "100" | "200" | "300" | "350" | "400" | "500";
}

export interface DisciplineCalculationResult {
  totalCost: number;
  costPerSqft: number;
  accuracyRange: string;
  disciplineCosts: Record<string, number>;
  appliedAdjustments: Record<string, number>;
}

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

    // Calculate discipline costs
    let totalDisciplineCost = 0;
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
      totalDisciplineCost += disciplineTotal;
    }

    // Apply adjustments
    const adjustments: Record<string, number> = {};

    // Regional multiplier
    const regionalMultiplier = Number(city.regionalMultiplier);
    adjustments.regional = regionalMultiplier;
    totalDisciplineCost *= regionalMultiplier;

    // Climate adjustment
    const climateAdjustment = 1 + Number(city.climateAdjustment) / 100;
    adjustments.climate = climateAdjustment;
    totalDisciplineCost *= climateAdjustment;

    // Complexity factor
    const complexityFactors: Record<string, number> = {
      simple: 1.0,
      moderate: 1.15,
      complex: 1.30,
    };
    const complexityFactor = complexityFactors[input.buildingComplexity];
    adjustments.complexity = complexityFactor;
    totalDisciplineCost *= complexityFactor;

    // Green certification factor
    const certificationFactors: Record<string, number> = {
      none: 1.0,
      LEED: 1.18,
      IGBC: 1.15,
    };
    const certificationFactor = certificationFactors[input.greenCertification];
    adjustments.certification = certificationFactor;
    totalDisciplineCost *= certificationFactor;

    // Material quality factor
    const materialFactors: Record<string, number> = {
      standard: 1.0,
      premium: 1.25,
      imported: 1.60,
    };
    const materialFactor = materialFactors[input.materialQuality];
    adjustments.material = materialFactor;
    totalDisciplineCost *= materialFactor;

    // Timeline factor
    const timelineFactors: Record<string, number> = {
      standard: 1.0,
      "fast-track": 1.15,
      delayed: 1.0,
    };
    const timelineFactor = timelineFactors[input.projectTimeline];
    adjustments.timeline = timelineFactor;
    totalDisciplineCost *= timelineFactor;

    // LOD accuracy range
    const lodAccuracyRanges: Record<string, { min: number; max: number }> = {
      "100": { min: 30, max: 30 },
      "200": { min: 20, max: 20 },
      "300": { min: 15, max: 15 },
      "350": { min: 10, max: 10 },
      "400": { min: 5, max: 5 },
      "500": { min: 0, max: 0 },
    };
    const lodRange = lodAccuracyRanges[input.lodLevel];
    const lodAdjustment = 1 + lodRange.max / 100;
    adjustments.lod = lodAdjustment;

    const adjustedCost = totalDisciplineCost * lodAdjustment;
    const costPerSqft = adjustedCost / input.buildingArea;

    // Apply adjustments to breakdown
    const adjustedBreakdown: Record<string, number> = {};
    for (const [discipline, cost] of Object.entries(disciplineCostBreakdown)) {
      adjustedBreakdown[discipline] = Math.round((cost * regionalMultiplier * climateAdjustment * complexityFactor * certificationFactor * materialFactor * timelineFactor * lodAdjustment) / input.disciplines.length);
    }

    return {
      totalCost: Math.round(adjustedCost),
      costPerSqft: Math.round(costPerSqft * 100) / 100,
      accuracyRange: `±${lodRange.max}%`,
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
