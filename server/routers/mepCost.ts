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
  getAllMepCities,
  updateMepCity,
  createMepComponentCost,
  getMepComponentCostById,
  getMepComponentCostsByType,
  getAllMepComponentCosts,
  updateMepComponentCost,
  createMepEstimate,
  getMepEstimateById,
  getMepEstimateByCode,
  getMepEstimatesByUser,
  getAllMepEstimates,
  updateMepEstimate,
  calculateMepCost,
  generateEstimateCode,
  getDisciplineCostsByCity,
  getDisciplineCost,
  calculateDisciplineCost,
} from "../db/mepCostDb";

// Helper to ensure admin access
function ensureAdmin(ctx: any) {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

export const mepCostRouter = router({
  // ==================== STATES ====================
  states: router({
    // Public: Get all states
    list: publicProcedure.query(async () => {
      return getAllMepStates();
    }),

    // Public: Get state by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const state = await getMepStateById(input.id);
        if (!state) throw new TRPCError({ code: "NOT_FOUND", message: "State not found" });
        return state;
      }),

    // Admin: Create state
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

    // Admin: Update state
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

  // ==================== CITIES ====================
  cities: router({
    // Public: Get all cities
    list: publicProcedure.query(async () => {
      return getAllMepCities();
    }),

    // Public: Get cities by state
    byState: publicProcedure
      .input(z.object({ stateId: z.number() }))
      .query(async ({ input }) => {
        return getMepCitiesByState(input.stateId);
      }),

    // Public: Get city by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const city = await getMepCityById(input.id);
        if (!city) throw new TRPCError({ code: "NOT_FOUND", message: "City not found" });
        return city;
      }),

    // Admin: Create city
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

    // Admin: Update city
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

  // ==================== MEP CALCULATOR ====================
  calculate: publicProcedure
    .input(z.object({
      projectType: z.enum(["residential", "commercial", "industrial", "hospitality", "mixed-use"]),
      buildingArea: z.number().min(1),
      cityId: z.number(),
      buildingComplexity: z.enum(["simple", "moderate", "complex"]).default("moderate"),
      greenCertification: z.enum(["none", "LEED", "IGBC"]).default("none"),
      materialQuality: z.enum(["standard", "premium", "imported"]).default("standard"),
      projectTimeline: z.enum(["standard", "fast-track", "delayed"]).default("standard"),
      lodLevel: z.enum(["100", "200", "300", "350", "400", "500"]).default("300"),
    }))
    .mutation(async ({ input }) => {
      const result = await calculateMepCost(input);
      if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to calculate MEP cost" });
      return result;
    }),

  // ==================== ESTIMATES ====================
  estimates: router({
    // Public: Get estimate by code
    getByCode: publicProcedure
      .input(z.object({ estimateCode: z.string() }))
      .query(async ({ input }) => {
        const estimate = await getMepEstimateByCode(input.estimateCode);
        if (!estimate) throw new TRPCError({ code: "NOT_FOUND" });
        return estimate;
      }),

    // Public: Get all public estimates
    listPublic: publicProcedure.query(async () => {
      return getAllMepEstimates();
    }),

    // Protected: Get user's estimates
    listMine: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getMepEstimatesByUser(ctx.user.id);
    }),

    // Protected: Save estimate
    save: protectedProcedure
      .input(z.object({
        projectName: z.string().optional(),
        projectType: z.enum(["residential", "commercial", "industrial", "hospitality", "mixed-use"]),
        projectSubType: z.string().optional(),
        buildingArea: z.number(),
        cityId: z.number(),
        buildingComplexity: z.enum(["simple", "moderate", "complex"]),
        greenCertification: z.enum(["none", "LEED", "IGBC"]),
        materialQuality: z.enum(["standard", "premium", "imported"]),
        projectTimeline: z.enum(["standard", "fast-track", "delayed"]),
        lodLevel: z.enum(["100", "200", "300", "350", "400", "500"]),
        baseMepCost: z.number(),
        adjustedMepCost: z.number(),
        costPerSqft: z.number(),
        accuracyRange: z.string(),
        mechanicalCost: z.number(),
        electricalCost: z.number(),
        plumbingCost: z.number(),
        fireSafetyCost: z.number(),
        smartSystemsCost: z.number(),
        appliedAdjustments: z.record(z.string(), z.number()),
        isPublic: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const estimateCode = generateEstimateCode();
        const estimate = await createMepEstimate({
          estimateCode,
          projectName: input.projectName,
          projectType: input.projectType,
          projectSubType: input.projectSubType,
          buildingArea: input.buildingArea.toString(),
          cityId: input.cityId,
          buildingComplexity: input.buildingComplexity,
          greenCertification: input.greenCertification,
          materialQuality: input.materialQuality,
          projectTimeline: input.projectTimeline,
          lodLevel: input.lodLevel,
          baseMepCost: input.baseMepCost.toString(),
          adjustedMepCost: input.adjustedMepCost.toString(),
          costPerSqft: input.costPerSqft.toString(),
          accuracyRange: input.accuracyRange,
          mechanicalCost: input.mechanicalCost.toString(),
          electricalCost: input.electricalCost.toString(),
          plumbingCost: input.plumbingCost.toString(),
          fireSafetyCost: input.fireSafetyCost.toString(),
          smartSystemsCost: input.smartSystemsCost.toString(),
          appliedAdjustments: JSON.stringify(input.appliedAdjustments),
          userId: ctx.user.id,
          userEmail: ctx.user.email,
          isPublic: input.isPublic,
        });

        if (!estimate) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return estimate;
      }),
  }),

  // ==================== DISCIPLINE CALCULATION ====================
  disciplines: router({
    // Public: Get disciplines for a city
    getByCity: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ input }) => {
        return getDisciplineCostsByCity(input.cityId);
      }),

    // Public: Get specific discipline cost
    getOne: publicProcedure
      .input(z.object({
        cityId: z.number(),
        discipline: z.enum(["electrical", "plumbing", "hvac", "fire-system"]),
      }))
      .query(async ({ input }) => {
        return getDisciplineCost(input.cityId, input.discipline);
      }),

    // Public: Calculate discipline-based cost
    calculate: publicProcedure
      .input(z.object({
        projectType: z.enum(["residential", "commercial", "industrial", "hospitality", "mixed-use"]),
        buildingArea: z.number().positive(),
        cityId: z.number(),
        disciplines: z.array(z.enum(["electrical", "plumbing", "hvac", "fire-system"])).min(1),
        buildingComplexity: z.enum(["simple", "moderate", "complex"]).default("moderate"),
        greenCertification: z.enum(["none", "LEED", "IGBC"]).default("none"),
        materialQuality: z.enum(["standard", "premium", "imported"]).default("standard"),
        projectTimeline: z.enum(["standard", "fast-track", "delayed"]).default("standard"),
        lodLevel: z.enum(["100", "200", "300", "350", "400", "500"]).default("300"),
      }))
      .query(async ({ input }) => {
        const result = await calculateDisciplineCost(input);
        if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to calculate cost" });
        return result;
      }),
  }),
});
