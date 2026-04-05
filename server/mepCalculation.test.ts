import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Create a public context (no user)
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("MEP Calculator", () => {
  it("should have getStates endpoint that returns an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const states = await caller.mepCost.getStates();
    expect(Array.isArray(states)).toBe(true);
    expect(states.length).toBeGreaterThan(0);
  });

  it("should have getCitiesByState endpoint that returns cities", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const states = await caller.mepCost.getStates();
    if (states.length > 0) {
      const cities = await caller.mepCost.getCitiesByState({ stateId: states[0].id });
      expect(Array.isArray(cities)).toBe(true);
    }
  });

  it("should calculate MEP cost without LOD and discipline costs should sum to total", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Get a valid city ID first
    const states = await caller.mepCost.getStates();
    expect(states.length).toBeGreaterThan(0);

    const cities = await caller.mepCost.getCitiesByState({ stateId: states[0].id });
    if (cities.length === 0) return; // Skip if no cities

    const cityId = cities[0].id;

    const result = await caller.mepCost.disciplines.calculate({
      constructionCost: 2000000,
      projectType: "residential",
      cityId,
      selectedDisciplines: ["electrical", "plumbing"],
      areaUnit: "sqft",
      buildingArea: 1000,
    });

    // Verify result structure
    expect(result).toHaveProperty("totalMepCost");
    expect(result).toHaveProperty("mepPercentage");
    expect(result).toHaveProperty("disciplineBreakdown");
    expect(result).toHaveProperty("costPerUnit");
    expect(result).toHaveProperty("accuracyRange");

    // MEP should NOT have LOD
    expect(result.accuracyRange).toBe("±15%");

    // Discipline costs should sum to total
    const breakdown = result.disciplineBreakdown;
    let sumOfSelected = 0;
    for (const [discipline, data] of Object.entries(breakdown)) {
      if (["electrical", "plumbing"].includes(discipline)) {
        sumOfSelected += (data as any).cost;
      } else {
        // Non-selected disciplines should have cost = 0
        expect((data as any).cost).toBe(0);
      }
    }
    expect(sumOfSelected).toBe(result.totalMepCost);

    // Cost per unit should be total / area
    expect(result.costPerUnit).toBeCloseTo(result.totalMepCost / 1000, 1);

    // MEP percentage should be between 1-2%
    expect(result.mepPercentage).toBeGreaterThanOrEqual(1);
    expect(result.mepPercentage).toBeLessThanOrEqual(2);
  });

  it("should calculate different costs for different discipline combinations", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const states = await caller.mepCost.getStates();
    if (states.length === 0) return;

    const cities = await caller.mepCost.getCitiesByState({ stateId: states[0].id });
    if (cities.length === 0) return;

    const cityId = cities[0].id;
    const baseInput = {
      constructionCost: 5000000,
      projectType: "commercial" as const,
      cityId,
      areaUnit: "sqft" as const,
      buildingArea: 2000,
    };

    // Single discipline
    const singleResult = await caller.mepCost.disciplines.calculate({
      ...baseInput,
      selectedDisciplines: ["electrical"],
    });

    // Two disciplines
    const doubleResult = await caller.mepCost.disciplines.calculate({
      ...baseInput,
      selectedDisciplines: ["electrical", "plumbing"],
    });

    // All four disciplines
    const allResult = await caller.mepCost.disciplines.calculate({
      ...baseInput,
      selectedDisciplines: ["electrical", "plumbing", "hvac", "fire-system"],
    });

    // More disciplines = higher total cost
    expect(doubleResult.totalMepCost).toBeGreaterThan(singleResult.totalMepCost);
    expect(allResult.totalMepCost).toBeGreaterThan(doubleResult.totalMepCost);

    // Electrical cost should be the same regardless of how many other disciplines are selected
    expect(singleResult.disciplineBreakdown["electrical"].cost)
      .toBe(doubleResult.disciplineBreakdown["electrical"].cost);
    expect(singleResult.disciplineBreakdown["electrical"].cost)
      .toBe(allResult.disciplineBreakdown["electrical"].cost);
  });

  it("should generate HTML report with IMI branding", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mepCost.generateReport({
      projectType: "residential",
      buildingArea: 1000,
      areaUnit: "sqft",
      complexity: "moderate",
      greenCertification: "none",
      materialQuality: "standard",
      selectedDisciplines: ["electrical", "plumbing"],
      totalCost: 30000,
      costPerUnit: 30,
      accuracyRange: "±15%",
      disciplineCosts: { electrical: 18000, plumbing: 12000 },
      city: "Mumbai",
      state: "Maharashtra",
    });

    expect(result).toHaveProperty("html");
    expect(result.html).toContain("IMI DESIGN");
    expect(result.html).toContain("₹30,000");
    expect(result.html).toContain("Electrical");
    expect(result.html).toContain("Plumbing");
    expect(result.html).toContain("Mumbai");
  });
});
