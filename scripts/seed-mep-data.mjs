import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { mepStates, mepCities } from "../drizzle/schema.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Parse connection string
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
};

// Indian states with regional data
const statesData = [
  // North
  { stateName: "Delhi", stateCode: "DL", region: "North", baseMultiplier: 1.15 },
  { stateName: "Haryana", stateCode: "HR", region: "North", baseMultiplier: 1.05 },
  { stateName: "Punjab", stateCode: "PB", region: "North", baseMultiplier: 1.02 },
  { stateName: "Himachal Pradesh", stateCode: "HP", region: "North", baseMultiplier: 1.08 },
  { stateName: "Jammu & Kashmir", stateCode: "JK", region: "North", baseMultiplier: 1.10 },
  { stateName: "Uttarakhand", stateCode: "UK", region: "North", baseMultiplier: 1.05 },
  { stateName: "Uttar Pradesh", stateCode: "UP", region: "North", baseMultiplier: 0.95 },

  // South
  { stateName: "Karnataka", stateCode: "KA", region: "South", baseMultiplier: 1.08 },
  { stateName: "Tamil Nadu", stateCode: "TN", region: "South", baseMultiplier: 1.05 },
  { stateName: "Telangana", stateCode: "TG", region: "South", baseMultiplier: 1.06 },
  { stateName: "Andhra Pradesh", stateCode: "AP", region: "South", baseMultiplier: 1.02 },
  { stateName: "Kerala", stateCode: "KL", region: "South", baseMultiplier: 1.12 },

  // East
  { stateName: "West Bengal", stateCode: "WB", region: "East", baseMultiplier: 0.98 },
  { stateName: "Bihar", stateCode: "BR", region: "East", baseMultiplier: 0.88 },
  { stateName: "Jharkhand", stateCode: "JH", region: "East", baseMultiplier: 0.92 },
  { stateName: "Odisha", stateCode: "OD", region: "East", baseMultiplier: 0.95 },

  // West
  { stateName: "Maharashtra", stateCode: "MH", region: "West", baseMultiplier: 1.12 },
  { stateName: "Gujarat", stateCode: "GJ", region: "West", baseMultiplier: 1.08 },
  { stateName: "Goa", stateCode: "GA", region: "West", baseMultiplier: 1.10 },
  { stateName: "Rajasthan", stateCode: "RJ", region: "West", baseMultiplier: 0.98 },

  // Northeast
  { stateName: "Assam", stateCode: "AS", region: "Northeast", baseMultiplier: 0.92 },
  { stateName: "Meghalaya", stateCode: "ML", region: "Northeast", baseMultiplier: 0.95 },
  { stateName: "Manipur", stateCode: "MN", region: "Northeast", baseMultiplier: 0.90 },
  { stateName: "Mizoram", stateCode: "MZ", region: "Northeast", baseMultiplier: 0.92 },
  { stateName: "Nagaland", stateCode: "NL", region: "Northeast", baseMultiplier: 0.91 },
  { stateName: "Sikkim", stateCode: "SK", region: "Northeast", baseMultiplier: 1.05 },
  { stateName: "Tripura", stateCode: "TR", region: "Northeast", baseMultiplier: 0.90 },
  { stateName: "Arunachal Pradesh", stateCode: "AR", region: "Northeast", baseMultiplier: 0.95 },

  // Central
  { stateName: "Madhya Pradesh", stateCode: "MP", region: "Central", baseMultiplier: 0.92 },
  { stateName: "Chhattisgarh", stateCode: "CT", region: "Central", baseMultiplier: 0.90 },
];

// Major cities with construction costs (per sq ft in INR)
const citiesData = [
  // Delhi
  { stateName: "Delhi", cityName: "Delhi", tier: "Tier-1", baseCostResidential: 2500, baseCostCommercial: 3500, baseCostIndustrial: 2000, climateZone: "hot-dry", climateAdjustment: 8, laborCostMultiplier: 1.20 },
  { stateName: "Delhi", cityName: "Gurgaon", tier: "Tier-1", baseCostResidential: 2800, baseCostCommercial: 3800, baseCostIndustrial: 2200, climateZone: "hot-dry", climateAdjustment: 8, laborCostMultiplier: 1.25 },
  { stateName: "Delhi", cityName: "Noida", tier: "Tier-2", baseCostResidential: 2200, baseCostCommercial: 3200, baseCostIndustrial: 1900, climateZone: "hot-dry", climateAdjustment: 8, laborCostMultiplier: 1.15 },

  // Maharashtra
  { stateName: "Maharashtra", cityName: "Mumbai", tier: "Tier-1", baseCostResidential: 3200, baseCostCommercial: 4500, baseCostIndustrial: 2500, climateZone: "hot-humid", climateAdjustment: 12, laborCostMultiplier: 1.30 },
  { stateName: "Maharashtra", cityName: "Pune", tier: "Tier-1", baseCostResidential: 2600, baseCostCommercial: 3600, baseCostIndustrial: 2100, climateZone: "moderate", climateAdjustment: 0, laborCostMultiplier: 1.15 },
  { stateName: "Maharashtra", cityName: "Nagpur", tier: "Tier-2", baseCostResidential: 1800, baseCostCommercial: 2600, baseCostIndustrial: 1500, climateZone: "hot-dry", climateAdjustment: 5, laborCostMultiplier: 1.05 },

  // Karnataka
  { stateName: "Karnataka", cityName: "Bangalore", tier: "Tier-1", baseCostResidential: 2400, baseCostCommercial: 3400, baseCostIndustrial: 2000, climateZone: "moderate", climateAdjustment: 0, laborCostMultiplier: 1.18 },
  { stateName: "Karnataka", cityName: "Mangalore", tier: "Tier-2", baseCostResidential: 1900, baseCostCommercial: 2700, baseCostIndustrial: 1600, climateZone: "hot-humid", climateAdjustment: 10, laborCostMultiplier: 1.08 },

  // Tamil Nadu
  { stateName: "Tamil Nadu", cityName: "Chennai", tier: "Tier-1", baseCostResidential: 2200, baseCostCommercial: 3200, baseCostIndustrial: 1900, climateZone: "hot-humid", climateAdjustment: 12, laborCostMultiplier: 1.12 },
  { stateName: "Tamil Nadu", cityName: "Coimbatore", tier: "Tier-2", baseCostResidential: 1700, baseCostCommercial: 2400, baseCostIndustrial: 1400, climateZone: "moderate", climateAdjustment: 2, laborCostMultiplier: 1.05 },

  // Telangana
  { stateName: "Telangana", cityName: "Hyderabad", tier: "Tier-1", baseCostResidential: 2300, baseCostCommercial: 3300, baseCostIndustrial: 1950, climateZone: "hot-dry", climateAdjustment: 8, laborCostMultiplier: 1.15 },

  // Uttar Pradesh
  { stateName: "Uttar Pradesh", cityName: "Lucknow", tier: "Tier-2", baseCostResidential: 1600, baseCostCommercial: 2300, baseCostIndustrial: 1350, climateZone: "hot-dry", climateAdjustment: 5, laborCostMultiplier: 1.00 },
  { stateName: "Uttar Pradesh", cityName: "Kanpur", tier: "Tier-2", baseCostResidential: 1500, baseCostCommercial: 2200, baseCostIndustrial: 1300, climateZone: "hot-dry", climateAdjustment: 5, laborCostMultiplier: 0.98 },

  // Gujarat
  { stateName: "Gujarat", cityName: "Ahmedabad", tier: "Tier-1", baseCostResidential: 2100, baseCostCommercial: 3000, baseCostIndustrial: 1800, climateZone: "hot-dry", climateAdjustment: 8, laborCostMultiplier: 1.10 },
  { stateName: "Gujarat", cityName: "Surat", tier: "Tier-2", baseCostResidential: 1900, baseCostCommercial: 2700, baseCostIndustrial: 1600, climateZone: "hot-dry", climateAdjustment: 8, laborCostMultiplier: 1.08 },

  // West Bengal
  { stateName: "West Bengal", cityName: "Kolkata", tier: "Tier-1", baseCostResidential: 1900, baseCostCommercial: 2700, baseCostIndustrial: 1600, climateZone: "hot-humid", climateAdjustment: 10, laborCostMultiplier: 1.05 },

  // Kerala
  { stateName: "Kerala", cityName: "Kochi", tier: "Tier-1", baseCostResidential: 2200, baseCostCommercial: 3100, baseCostIndustrial: 1850, climateZone: "hot-humid", climateAdjustment: 15, laborCostMultiplier: 1.18 },

  // Rajasthan
  { stateName: "Rajasthan", cityName: "Jaipur", tier: "Tier-2", baseCostResidential: 1700, baseCostCommercial: 2400, baseCostIndustrial: 1450, climateZone: "hot-dry", climateAdjustment: 10, laborCostMultiplier: 1.02 },

  // Haryana
  { stateName: "Haryana", cityName: "Faridabad", tier: "Tier-2", baseCostResidential: 2000, baseCostCommercial: 2900, baseCostIndustrial: 1700, climateZone: "hot-dry", climateAdjustment: 8, laborCostMultiplier: 1.10 },

  // Punjab
  { stateName: "Punjab", cityName: "Chandigarh", tier: "Tier-2", baseCostResidential: 2000, baseCostCommercial: 2800, baseCostIndustrial: 1700, climateZone: "moderate", climateAdjustment: 0, laborCostMultiplier: 1.08 },

  // Madhya Pradesh
  { stateName: "Madhya Pradesh", cityName: "Indore", tier: "Tier-2", baseCostResidential: 1600, baseCostCommercial: 2300, baseCostIndustrial: 1350, climateZone: "hot-dry", climateAdjustment: 5, laborCostMultiplier: 1.00 },

  // Assam
  { stateName: "Assam", cityName: "Guwahati", tier: "Tier-3", baseCostResidential: 1400, baseCostCommercial: 2000, baseCostIndustrial: 1200, climateZone: "hot-humid", climateAdjustment: 12, laborCostMultiplier: 0.95 },
];

async function seedDatabase() {
  // Import dynamically to handle TypeScript
  const { mepStates: mepStatesTable, mepCities: mepCitiesTable } = await import("../drizzle/schema.ts");
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(config);
    const db = drizzle(connection);

    console.log("🌱 Starting database seeding...");

    // Insert states
    console.log("📍 Inserting states...");
    for (const state of statesData) {
      try {
        await db.insert(mepStatesTable).values({
          stateName: state.stateName,
          stateCode: state.stateCode,
          region: state.region,
          baseMultiplier: state.baseMultiplier.toString(),
          isActive: true,
        });
      } catch (error) {
        // Ignore duplicate key errors
        if (error.code !== "ER_DUP_ENTRY") {
          console.error(`Error inserting state ${state.stateName}:`, error.message);
        }
      }
    }
    console.log(`✅ Inserted ${statesData.length} states`);

    // Get state IDs
    const stateMap = new Map();
    for (const state of statesData) {
      const result = await db.select().from(mepStatesTable).where((t) => t.stateName === state.stateName);
      if (result.length > 0) {
        stateMap.set(state.stateName, result[0].id);
      }
    }

    // Insert cities
    console.log("🏙️  Inserting cities...");
    for (const city of citiesData) {
      const stateId = stateMap.get(city.stateName);
      if (!stateId) {
        console.warn(`⚠️  State not found for city ${city.cityName}`);
        continue;
      }

      try {
        await db.insert(mepCitiesTable).values({
          stateId,
          cityName: city.cityName,
          tier: city.tier,
          baseCostResidential: city.baseCostResidential.toString(),
          baseCostCommercial: city.baseCostCommercial.toString(),
          baseCostIndustrial: city.baseCostIndustrial.toString(),
          mepPercentageResidential: "12",
          mepPercentageCommercial: "15",
          mepPercentageIndustrial: "13",
          regionalMultiplier: "1.0",
          climateZone: city.climateZone,
          climateAdjustment: city.climateAdjustment.toString(),
          laborCostMultiplier: city.laborCostMultiplier.toString(),
          isActive: true,
        });
      } catch (error) {
        // Ignore duplicate key errors
        if (error.code !== "ER_DUP_ENTRY") {
          console.error(`Error inserting city ${city.cityName}:`, error.message);
        }
      }
    }
    console.log(`✅ Inserted ${citiesData.length} cities`);

    console.log("✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
