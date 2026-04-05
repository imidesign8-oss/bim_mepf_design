import { getDb } from "../server/db";
import { mepCities, mepDisciplineCosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Discipline cost percentages and base costs
const disciplineData = {
  electrical: {
    percentageOfMep: 35,
    residentialMultiplier: 0.35,
    commercialMultiplier: 0.40,
    industrialMultiplier: 0.38,
  },
  plumbing: {
    percentageOfMep: 20,
    residentialMultiplier: 0.20,
    commercialMultiplier: 0.18,
    industrialMultiplier: 0.15,
  },
  hvac: {
    percentageOfMep: 40,
    residentialMultiplier: 0.40,
    commercialMultiplier: 0.38,
    industrialMultiplier: 0.42,
  },
  "fire-system": {
    percentageOfMep: 5,
    residentialMultiplier: 0.05,
    commercialMultiplier: 0.04,
    industrialMultiplier: 0.05,
  },
};

async function seedDisciplineCosts() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Failed to connect to database");
      process.exit(1);
    }

    console.log("🌱 Seeding discipline costs...");

    // Get all cities
    const allCities = await db.select().from(mepCities);
    console.log(`Found ${allCities.length} cities`);

    let createdCount = 0;

    for (const city of allCities) {
      for (const [discipline, data] of Object.entries(disciplineData)) {
        try {
          // Calculate costs based on city's base costs
          const costResidential = Math.round(Number(city.baseCostResidential) * data.residentialMultiplier);
          const costCommercial = Math.round(Number(city.baseCostCommercial) * data.commercialMultiplier);
          const costIndustrial = Math.round(Number(city.baseCostIndustrial) * data.industrialMultiplier);

          await db.insert(mepDisciplineCosts).values({
            cityId: city.id,
            discipline: discipline as any,
            costResidential: costResidential.toString(),
            costCommercial: costCommercial.toString(),
            costIndustrial: costIndustrial.toString(),
            percentageOfMep: data.percentageOfMep.toString(),
            isActive: true,
          });

          createdCount++;
        } catch (error: any) {
          // Ignore duplicate errors
          if (error.code !== "ER_DUP_ENTRY") {
            console.error(`Error creating discipline cost for ${city.cityName} - ${discipline}:`, error.message);
          }
        }
      }
    }

    console.log(`✅ Created ${createdCount} discipline cost records`);
    console.log("✨ Discipline cost seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

seedDisciplineCosts();
