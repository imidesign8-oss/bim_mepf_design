import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createMepState,
  getMepStateById,
  getAllMepStates,
  updateMepState,
  createMepCity,
  getMepCityById,
  getMepCitiesByState,
  updateMepCity,
  getDisciplineCostsByCity,
  updateDisciplineCost,
  createMepEstimate,
  getMepEstimateById,
  generateEstimateCode,
} from "../db/mepCostDb";
import { calculateMepCost, calculateBimCost } from "../db/mepCalculations";
import { generateMepReportHTML } from "../_core/mepReportGenerator";
import { getDb } from "../db";
import { mepCities } from "../../drizzle/schema";

// Helper to ensure admin access
function ensureAdmin(ctx: any) {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

export const mepCostRouter = router({
  // ==================== FLAT ROUTES FOR FRONTEND ====================
  // These match what the frontend calls: trpc.mepCost.getStates, trpc.mepCost.getCitiesByState

  getStates: publicProcedure.query(async () => {
    return getAllMepStates();
  }),

  getCitiesByState: publicProcedure
    .input(z.object({ stateId: z.number() }))
    .query(async ({ input }) => {
      return getMepCitiesByState(input.stateId);
    }),

  getAllCities: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      return await db.select().from(mepCities);
    } catch (error) {
      console.error("[MEP] Error getting all cities:", error);
      return [];
    }
  }),

  // ==================== STATES ADMIN ====================
  states: router({
    list: publicProcedure.query(async () => {
      return getAllMepStates();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const state = await getMepStateById(input.id);
        if (!state) throw new TRPCError({ code: "NOT_FOUND", message: "State not found" });
        return state;
      }),

    create: protectedProcedure
      .input(z.object({
        stateName: z.string().min(1),
        stateCode: z.string().min(1),
        region: z.enum(["North", "South", "East", "West", "Northeast", "Central"]),
        baseMultiplier: z.number().default(1.0),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const state = await createMepState({
          stateName: input.stateName,
          stateCode: input.stateCode,
          region: input.region,
          baseMultiplier: input.baseMultiplier.toString(),
          description: input.description,
          isActive: true,
        });
        if (!state) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return state;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        baseMultiplier: z.number().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const state = await updateMepState(input.id, {
          baseMultiplier: input.baseMultiplier?.toString(),
          description: input.description,
          isActive: input.isActive,
        });
        if (!state) throw new TRPCError({ code: "NOT_FOUND" });
        return state;
      }),
  }),

  // ==================== CITIES ADMIN ====================
  cities: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try {
        return await db.select().from(mepCities);
      } catch (error) {
        return [];
      }
    }),

    byState: publicProcedure
      .input(z.object({ stateId: z.number() }))
      .query(async ({ input }) => {
        return getMepCitiesByState(input.stateId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const city = await getMepCityById(input.id);
        if (!city) throw new TRPCError({ code: "NOT_FOUND", message: "City not found" });
        return city;
      }),

    create: protectedProcedure
      .input(z.object({
        stateId: z.number(),
        cityName: z.string().min(1),
        tier: z.enum(["Tier-1", "Tier-2", "Tier-3"]),
        baseCostResidential: z.number(),
        baseCostCommercial: z.number(),
        baseCostIndustrial: z.number(),
        mepPercentageResidential: z.number().default(12),
        mepPercentageCommercial: z.number().default(15),
        mepPercentageIndustrial: z.number().default(13),
        regionalMultiplier: z.number().default(1.0),
        climateZone: z.enum(["hot-humid", "hot-dry", "moderate", "cold"]),
        climateAdjustment: z.number().default(0),
        laborCostMultiplier: z.number().default(1.0),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const city = await createMepCity({
          stateId: input.stateId,
          cityName: input.cityName,
          tier: input.tier,
          baseCostResidential: input.baseCostResidential.toString(),
          baseCostCommercial: input.baseCostCommercial.toString(),
          baseCostIndustrial: input.baseCostIndustrial.toString(),
          mepPercentageResidential: input.mepPercentageResidential.toString(),
          mepPercentageCommercial: input.mepPercentageCommercial.toString(),
          mepPercentageIndustrial: input.mepPercentageIndustrial.toString(),
          regionalMultiplier: input.regionalMultiplier.toString(),
          climateZone: input.climateZone,
          climateAdjustment: input.climateAdjustment.toString(),
          laborCostMultiplier: input.laborCostMultiplier.toString(),
          isActive: true,
          notes: input.notes,
        });
        if (!city) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return city;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        baseCostResidential: z.number().optional(),
        baseCostCommercial: z.number().optional(),
        baseCostIndustrial: z.number().optional(),
        mepPercentageResidential: z.number().optional(),
        mepPercentageCommercial: z.number().optional(),
        mepPercentageIndustrial: z.number().optional(),
        regionalMultiplier: z.number().optional(),
        climateAdjustment: z.number().optional(),
        laborCostMultiplier: z.number().optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const { id, ...updateData } = input;
        const city = await updateMepCity(id, {
          baseCostResidential: updateData.baseCostResidential?.toString(),
          baseCostCommercial: updateData.baseCostCommercial?.toString(),
          baseCostIndustrial: updateData.baseCostIndustrial?.toString(),
          mepPercentageResidential: updateData.mepPercentageResidential?.toString(),
          mepPercentageCommercial: updateData.mepPercentageCommercial?.toString(),
          mepPercentageIndustrial: updateData.mepPercentageIndustrial?.toString(),
          regionalMultiplier: updateData.regionalMultiplier?.toString(),
          climateAdjustment: updateData.climateAdjustment?.toString(),
          laborCostMultiplier: updateData.laborCostMultiplier?.toString(),
          isActive: updateData.isActive,
          notes: updateData.notes,
        });
        if (!city) throw new TRPCError({ code: "NOT_FOUND" });
        return city;
      }),
  }),

  // ==================== MEP CALCULATOR (No LOD!) ====================
  disciplines: router({
    // Get disciplines for a city
    getByCity: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ input }) => {
        return getDisciplineCostsByCity(input.cityId);
      }),

    // MEP Cost Calculation - uses mepCalculations.ts (correct engine)
    // Formula: Construction Cost × MEP % (1-2%) × Discipline Weightage
    // NO LOD for MEP!
    calculate: publicProcedure
      .input(z.object({
        constructionCost: z.number().positive(),
        projectType: z.enum(["residential", "commercial", "industrial", "hospitality", "mixed-use"]),
        cityId: z.number(),
        selectedDisciplines: z.array(z.enum(["electrical", "plumbing", "hvac", "fire-system"])).min(1),
        areaUnit: z.enum(["sqft", "sqm"]),
        buildingArea: z.number().positive(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await calculateMepCost({
            constructionCost: input.constructionCost,
            projectType: input.projectType,
            cityId: input.cityId,
            selectedDisciplines: input.selectedDisciplines,
            areaUnit: input.areaUnit,
            buildingArea: input.buildingArea,
          });
          return result;
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to calculate MEP cost",
          });
        }
      }),

    // Admin: Update discipline cost
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        costResidential: z.number().optional(),
        costCommercial: z.number().optional(),
        costIndustrial: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        ensureAdmin(ctx);
        const result = await updateDisciplineCost(input.id, {
          costResidential: input.costResidential?.toString(),
          costCommercial: input.costCommercial?.toString(),
          costIndustrial: input.costIndustrial?.toString(),
        });
        if (!result) throw new TRPCError({ code: "NOT_FOUND" });
        return result;
      }),
  }),

  // ==================== BIM CALCULATOR (with LOD) ====================
  bim: router({
    calculate: publicProcedure
      .input(z.object({
        projectCost: z.number().positive(),
        projectType: z.enum(["residential", "commercial", "industrial", "hospitality", "mixed-use"]),
        cityId: z.number(),
        lodLevel: z.enum(["100", "200", "300", "400", "500"]),
        areaUnit: z.enum(["sqft", "sqm"]),
        buildingArea: z.number().positive(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await calculateBimCost({
            projectCost: input.projectCost,
            projectType: input.projectType,
            cityId: input.cityId,
            lodLevel: input.lodLevel,
            areaUnit: input.areaUnit,
            buildingArea: input.buildingArea,
          });
          return result;
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to calculate BIM cost",
          });
        }
      }),
  }),

  // ==================== PDF REPORT GENERATION ====================
  generateReport: publicProcedure
    .input(z.object({
      projectType: z.string(),
      buildingArea: z.number(),
      areaUnit: z.enum(["sqft", "sqm"]),
      complexity: z.string().default("moderate"),
      greenCertification: z.string().default("none"),
      materialQuality: z.string().default("standard"),
      selectedDisciplines: z.array(z.string()),
      totalCost: z.number(),
      costPerUnit: z.number(),
      accuracyRange: z.string(),
      disciplineCosts: z.record(z.string(), z.number()),
      city: z.string(),
      state: z.string(),
    }))
    .mutation(async ({ input }) => {
      const html = generateMepReportHTML({
        projectType: input.projectType,
        buildingArea: input.buildingArea,
        areaUnit: input.areaUnit,
        complexity: input.complexity,
        greenCertification: input.greenCertification,
        materialQuality: input.materialQuality,
        selectedDisciplines: input.selectedDisciplines,
        totalCost: input.totalCost,
        costPerUnit: input.costPerUnit,
        accuracyRange: input.accuracyRange,
        disciplineCosts: input.disciplineCosts,
        city: input.city,
        state: input.state,
        generatedDate: new Date().toLocaleDateString("en-IN"),
      });
      return { html };
    }),

  // ==================== ESTIMATES ====================
  estimates: router({
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const estimate = await getMepEstimateById(input.id);
        if (!estimate) throw new TRPCError({ code: "NOT_FOUND" });
        return estimate;
      }),

    save: protectedProcedure
      .input(z.object({
        projectName: z.string().optional(),
        projectType: z.enum(["residential", "commercial", "industrial", "hospitality", "mixed-use"]),
        buildingArea: z.number(),
        cityId: z.number(),
        totalCost: z.number(),
        costPerUnit: z.number(),
        accuracyRange: z.string(),
        disciplineCosts: z.record(z.string(), z.number()),
        selectedDisciplines: z.array(z.string()),
        vertical: z.enum(["bim", "mep"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const estimateCode = generateEstimateCode();
        const estimate = await createMepEstimate({
          estimateCode,
          projectName: input.projectName,
          projectType: input.projectType,
          buildingArea: input.buildingArea.toString(),
          cityId: input.cityId,
          baseMepCost: input.totalCost.toString(),
          adjustedMepCost: input.totalCost.toString(),
          costPerSqft: input.costPerUnit.toString(),
          accuracyRange: input.accuracyRange,
          mechanicalCost: (input.disciplineCosts["hvac"] || 0).toString(),
          electricalCost: (input.disciplineCosts["electrical"] || 0).toString(),
          plumbingCost: (input.disciplineCosts["plumbing"] || 0).toString(),
          fireSafetyCost: (input.disciplineCosts["fire-system"] || 0).toString(),
          smartSystemsCost: "0",
          appliedAdjustments: JSON.stringify(input.disciplineCosts),
          userId: ctx.user.id,
          userEmail: ctx.user.email,
          isPublic: false,
          // Required fields with defaults
          buildingComplexity: "moderate",
          greenCertification: "none",
          materialQuality: "standard",
          projectTimeline: "standard",
          lodLevel: "300",
        });

        if (!estimate) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return estimate;
      }),
  }),
});
