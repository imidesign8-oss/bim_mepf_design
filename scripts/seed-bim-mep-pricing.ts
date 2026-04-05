import { getDb } from "../server/db";
import {
  mepCostRange,
  mepDisciplineWeightage,
  bimLodPricing,
  mepCities,
} from "../drizzle/schema";

export async function seedBimMepPricing() {
  console.log("Seeding BIM and MEP pricing data...");

  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Failed to connect to database");
    }

    // 1. Seed MEP Cost Range (1-2% of construction cost)
    console.log("Seeding MEP cost ranges...");
    const mepRanges = [
      {
        projectType: "residential" as const,
        minPercentage: "1.00",
        maxPercentage: "2.00",
        defaultPercentage: "1.50",
        description: "Residential projects: MEP design 1-2% of construction cost",
      },
      {
        projectType: "commercial" as const,
        minPercentage: "1.20",
        maxPercentage: "2.20",
        defaultPercentage: "1.70",
        description: "Commercial projects: MEP design 1.2-2.2% of construction cost",
      },
      {
        projectType: "industrial" as const,
        minPercentage: "1.30",
        maxPercentage: "2.30",
        defaultPercentage: "1.80",
        description: "Industrial projects: MEP design 1.3-2.3% of construction cost",
      },
      {
        projectType: "hospitality" as const,
        minPercentage: "1.40",
        maxPercentage: "2.40",
        defaultPercentage: "1.90",
        description: "Hospitality projects: MEP design 1.4-2.4% of construction cost",
      },
      {
        projectType: "mixed-use" as const,
        minPercentage: "1.50",
        maxPercentage: "2.50",
        defaultPercentage: "2.00",
        description: "Mixed-use projects: MEP design 1.5-2.5% of construction cost",
      },
    ];

    for (const range of mepRanges) {
      await db.insert(mepCostRange).values(range).onDuplicateKeyUpdate({
        set: {
          minPercentage: range.minPercentage,
          maxPercentage: range.maxPercentage,
          defaultPercentage: range.defaultPercentage,
        },
      });
    }
    console.log("✓ MEP cost ranges seeded");

    // 2. Seed MEP Discipline Weightage
    console.log("Seeding MEP discipline weightage...");
    const disciplineWeightages = [
      {
        discipline: "electrical" as const,
        weightagePercentage: "35.00",
        description: "Electrical design: 35% of total MEP cost",
      },
      {
        discipline: "plumbing" as const,
        weightagePercentage: "25.00",
        description: "Plumbing design: 25% of total MEP cost",
      },
      {
        discipline: "hvac" as const,
        weightagePercentage: "30.00",
        description: "HVAC design: 30% of total MEP cost",
      },
      {
        discipline: "fire-system" as const,
        weightagePercentage: "10.00",
        description: "Fire system design: 10% of total MEP cost",
      },
    ];

    for (const weightage of disciplineWeightages) {
      await db.insert(mepDisciplineWeightage).values(weightage).onDuplicateKeyUpdate({
        set: {
          weightagePercentage: weightage.weightagePercentage,
        },
      });
    }
    console.log("✓ MEP discipline weightage seeded");

    // 3. Seed BIM LOD Pricing for each city
    console.log("Seeding BIM LOD pricing...");
    const cities = await db.select().from(mepCities);

    const lodLevels = [
      {
        lodLevel: "100" as const,
        bimPercentageResidential: "4.00",
        bimPercentageCommercial: "4.50",
        bimPercentageIndustrial: "5.00",
        description: "LOD 100: Conceptual design - 4-5% of project cost",
      },
      {
        lodLevel: "200" as const,
        bimPercentageResidential: "5.00",
        bimPercentageCommercial: "5.50",
        bimPercentageIndustrial: "6.00",
        description: "LOD 200: Preliminary design - 5-6% of project cost",
      },
      {
        lodLevel: "300" as const,
        bimPercentageResidential: "6.00",
        bimPercentageCommercial: "6.50",
        bimPercentageIndustrial: "7.00",
        description: "LOD 300: Design development - 6-7% of project cost",
      },
      {
        lodLevel: "400" as const,
        bimPercentageResidential: "7.50",
        bimPercentageCommercial: "8.00",
        bimPercentageIndustrial: "8.50",
        description: "LOD 400: Construction documents - 7.5-8.5% of project cost",
      },
      {
        lodLevel: "500" as const,
        bimPercentageResidential: "8.50",
        bimPercentageCommercial: "9.00",
        bimPercentageIndustrial: "10.00",
        description: "LOD 500: As-built - 8.5-10% of project cost",
      },
    ];

    for (const city of cities) {
      for (const lod of lodLevels) {
        await db.insert(bimLodPricing).values({
          cityId: city.id,
          ...lod,
        }).onDuplicateKeyUpdate({
          set: {
            bimPercentageResidential: lod.bimPercentageResidential,
            bimPercentageCommercial: lod.bimPercentageCommercial,
            bimPercentageIndustrial: lod.bimPercentageIndustrial,
          },
        });
      }
    }
    console.log(`✓ BIM LOD pricing seeded for ${cities.length} cities`);

    console.log("✅ BIM and MEP pricing data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding BIM and MEP pricing:", error);
    throw error;
  }
}

seedBimMepPricing().catch(console.error);
