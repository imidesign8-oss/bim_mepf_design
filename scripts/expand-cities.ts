import { getDb } from "../server/db";
import { mepCities } from "../drizzle/schema";

// Comprehensive city data for all Indian states
const citiesData = [
  // Andhra Pradesh
  { state: "Andhra Pradesh", cities: [
    { name: "Hyderabad", tier: "Tier-1", residential: 2800, commercial: 4200, industrial: 2400, climate: "hot-humid" },
    { name: "Visakhapatnam", tier: "Tier-2", residential: 2200, commercial: 3200, industrial: 1900, climate: "hot-humid" },
    { name: "Vijayawada", tier: "Tier-2", residential: 1900, commercial: 2800, industrial: 1700, climate: "hot-humid" },
  ]},
  // Arunachal Pradesh
  { state: "Arunachal Pradesh", cities: [
    { name: "Itanagar", tier: "Tier-3", residential: 1800, commercial: 2600, industrial: 1500, climate: "moderate" },
  ]},
  // Assam
  { state: "Assam", cities: [
    { name: "Guwahati", tier: "Tier-2", residential: 2100, commercial: 3000, industrial: 1800, climate: "moderate" },
    { name: "Silchar", tier: "Tier-3", residential: 1700, commercial: 2400, industrial: 1400, climate: "moderate" },
  ]},
  // Bihar
  { state: "Bihar", cities: [
    { name: "Patna", tier: "Tier-2", residential: 1900, commercial: 2800, industrial: 1600, climate: "hot-dry" },
    { name: "Gaya", tier: "Tier-3", residential: 1600, commercial: 2300, industrial: 1400, climate: "hot-dry" },
  ]},
  // Chhattisgarh
  { state: "Chhattisgarh", cities: [
    { name: "Raipur", tier: "Tier-2", residential: 2000, commercial: 2900, industrial: 1700, climate: "hot-humid" },
    { name: "Bilaspur", tier: "Tier-3", residential: 1700, commercial: 2500, industrial: 1500, climate: "hot-humid" },
  ]},
  // Goa
  { state: "Goa", cities: [
    { name: "Panaji", tier: "Tier-2", residential: 2600, commercial: 3800, industrial: 2200, climate: "hot-humid" },
  ]},
  // Gujarat
  { state: "Gujarat", cities: [
    { name: "Ahmedabad", tier: "Tier-1", residential: 2700, commercial: 4000, industrial: 2300, climate: "hot-dry" },
    { name: "Surat", tier: "Tier-1", residential: 2600, commercial: 3900, industrial: 2200, climate: "hot-dry" },
    { name: "Vadodara", tier: "Tier-2", residential: 2300, commercial: 3400, industrial: 2000, climate: "hot-dry" },
    { name: "Rajkot", tier: "Tier-2", residential: 2100, commercial: 3100, industrial: 1800, climate: "hot-dry" },
  ]},
  // Haryana
  { state: "Haryana", cities: [
    { name: "Faridabad", tier: "Tier-2", residential: 2400, commercial: 3600, industrial: 2100, climate: "moderate" },
    { name: "Gurgaon", tier: "Tier-1", residential: 3200, commercial: 4800, industrial: 2800, climate: "moderate" },
  ]},
  // Himachal Pradesh
  { state: "Himachal Pradesh", cities: [
    { name: "Shimla", tier: "Tier-3", residential: 2000, commercial: 2900, industrial: 1700, climate: "cold" },
  ]},
  // Jharkhand
  { state: "Jharkhand", cities: [
    { name: "Ranchi", tier: "Tier-2", residential: 1900, commercial: 2800, industrial: 1600, climate: "moderate" },
    { name: "Jamshedpur", tier: "Tier-2", residential: 2000, commercial: 2900, industrial: 1700, climate: "moderate" },
  ]},
  // Karnataka
  { state: "Karnataka", cities: [
    { name: "Bangalore", tier: "Tier-1", residential: 3000, commercial: 4500, industrial: 2600, climate: "moderate" },
    { name: "Mysore", tier: "Tier-2", residential: 2200, commercial: 3200, industrial: 1900, climate: "moderate" },
    { name: "Mangalore", tier: "Tier-2", residential: 2300, commercial: 3400, industrial: 2000, climate: "hot-humid" },
    { name: "Belgaum", tier: "Tier-3", residential: 1900, commercial: 2800, industrial: 1600, climate: "moderate" },
  ]},
  // Kerala
  { state: "Kerala", cities: [
    { name: "Kochi", tier: "Tier-1", residential: 2800, commercial: 4200, industrial: 2400, climate: "hot-humid" },
    { name: "Thiruvananthapuram", tier: "Tier-2", residential: 2400, commercial: 3600, industrial: 2100, climate: "hot-humid" },
    { name: "Kozhikode", tier: "Tier-2", residential: 2300, commercial: 3400, industrial: 2000, climate: "hot-humid" },
  ]},
  // Madhya Pradesh
  { state: "Madhya Pradesh", cities: [
    { name: "Indore", tier: "Tier-2", residential: 2200, commercial: 3200, industrial: 1900, climate: "hot-dry" },
    { name: "Bhopal", tier: "Tier-2", residential: 2100, commercial: 3100, industrial: 1800, climate: "hot-dry" },
    { name: "Jabalpur", tier: "Tier-3", residential: 1900, commercial: 2800, industrial: 1600, climate: "hot-dry" },
  ]},
  // Maharashtra
  { state: "Maharashtra", cities: [
    { name: "Mumbai", tier: "Tier-1", residential: 3500, commercial: 5200, industrial: 3000, climate: "hot-humid" },
    { name: "Pune", tier: "Tier-1", residential: 3100, commercial: 4600, industrial: 2700, climate: "moderate" },
    { name: "Nagpur", tier: "Tier-2", residential: 2300, commercial: 3400, industrial: 2000, climate: "hot-dry" },
    { name: "Nashik", tier: "Tier-2", residential: 2100, commercial: 3100, industrial: 1800, climate: "moderate" },
    { name: "Aurangabad", tier: "Tier-3", residential: 1900, commercial: 2800, industrial: 1600, climate: "hot-dry" },
  ]},
  // Manipur
  { state: "Manipur", cities: [
    { name: "Imphal", tier: "Tier-3", residential: 1700, commercial: 2500, industrial: 1500, climate: "moderate" },
  ]},
  // Meghalaya
  { state: "Meghalaya", cities: [
    { name: "Shillong", tier: "Tier-3", residential: 1800, commercial: 2600, industrial: 1500, climate: "moderate" },
  ]},
  // Mizoram
  { state: "Mizoram", cities: [
    { name: "Aizawl", tier: "Tier-3", residential: 1700, commercial: 2500, industrial: 1500, climate: "moderate" },
  ]},
  // Nagaland
  { state: "Nagaland", cities: [
    { name: "Kohima", tier: "Tier-3", residential: 1700, commercial: 2500, industrial: 1500, climate: "moderate" },
  ]},
  // Odisha
  { state: "Odisha", cities: [
    { name: "Bhubaneswar", tier: "Tier-2", residential: 2100, commercial: 3100, industrial: 1800, climate: "hot-humid" },
    { name: "Cuttack", tier: "Tier-2", residential: 2000, commercial: 2900, industrial: 1700, climate: "hot-humid" },
  ]},
  // Punjab
  { state: "Punjab", cities: [
    { name: "Chandigarh", tier: "Tier-1", residential: 2900, commercial: 4300, industrial: 2500, climate: "moderate" },
    { name: "Ludhiana", tier: "Tier-2", residential: 2300, commercial: 3400, industrial: 2000, climate: "moderate" },
    { name: "Amritsar", tier: "Tier-2", residential: 2200, commercial: 3200, industrial: 1900, climate: "moderate" },
  ]},
  // Rajasthan
  { state: "Rajasthan", cities: [
    { name: "Jaipur", tier: "Tier-1", residential: 2700, commercial: 4000, industrial: 2300, climate: "hot-dry" },
    { name: "Jodhpur", tier: "Tier-2", residential: 2100, commercial: 3100, industrial: 1800, climate: "hot-dry" },
    { name: "Kota", tier: "Tier-2", residential: 2000, commercial: 2900, industrial: 1700, climate: "hot-dry" },
  ]},
  // Sikkim
  { state: "Sikkim", cities: [
    { name: "Gangtok", tier: "Tier-3", residential: 1900, commercial: 2800, industrial: 1600, climate: "cold" },
  ]},
  // Tamil Nadu
  { state: "Tamil Nadu", cities: [
    { name: "Chennai", tier: "Tier-1", residential: 3000, commercial: 4500, industrial: 2600, climate: "hot-humid" },
    { name: "Coimbatore", tier: "Tier-2", residential: 2400, commercial: 3600, industrial: 2100, climate: "moderate" },
    { name: "Madurai", tier: "Tier-2", residential: 2200, commercial: 3200, industrial: 1900, climate: "hot-dry" },
    { name: "Salem", tier: "Tier-3", residential: 2000, commercial: 2900, industrial: 1700, climate: "hot-dry" },
  ]},
  // Telangana
  { state: "Telangana", cities: [
    { name: "Hyderabad", tier: "Tier-1", residential: 2800, commercial: 4200, industrial: 2400, climate: "hot-humid" },
    { name: "Warangal", tier: "Tier-3", residential: 1900, commercial: 2800, industrial: 1600, climate: "hot-humid" },
  ]},
  // Tripura
  { state: "Tripura", cities: [
    { name: "Agartala", tier: "Tier-3", residential: 1700, commercial: 2500, industrial: 1500, climate: "hot-humid" },
  ]},
  // Uttar Pradesh
  { state: "Uttar Pradesh", cities: [
    { name: "Delhi", tier: "Tier-1", residential: 3200, commercial: 4800, industrial: 2800, climate: "moderate" },
    { name: "Lucknow", tier: "Tier-2", residential: 2300, commercial: 3400, industrial: 2000, climate: "moderate" },
    { name: "Kanpur", tier: "Tier-2", residential: 2200, commercial: 3200, industrial: 1900, climate: "moderate" },
    { name: "Varanasi", tier: "Tier-2", residential: 2000, commercial: 2900, industrial: 1700, climate: "moderate" },
    { name: "Meerut", tier: "Tier-2", residential: 2100, commercial: 3100, industrial: 1800, climate: "moderate" },
  ]},
  // Uttarakhand
  { state: "Uttarakhand", cities: [
    { name: "Dehradun", tier: "Tier-2", residential: 2300, commercial: 3400, industrial: 2000, climate: "moderate" },
  ]},
  // West Bengal
  { state: "West Bengal", cities: [
    { name: "Kolkata", tier: "Tier-1", residential: 2900, commercial: 4300, industrial: 2500, climate: "hot-humid" },
    { name: "Darjeeling", tier: "Tier-3", residential: 2000, commercial: 2900, industrial: 1700, climate: "cold" },
  ]},
];

async function expandCities() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Failed to connect to database");
      process.exit(1);
    }

    console.log("🌱 Expanding city coverage...");

    // Get all states
    const { mepStates } = await import("../drizzle/schema");
    const allStates = await db.select().from(mepStates);
    
    let createdCount = 0;
    let skippedCount = 0;

    for (const stateGroup of citiesData) {
      const state = allStates.find((s) => s.stateName === stateGroup.state);
      if (!state) {
        console.log(`⚠️  State not found: ${stateGroup.state}`);
        continue;
      }

      for (const city of stateGroup.cities) {
        try {
          // Check if city already exists
          const existing = await db.select().from(mepCities).where(
            (c) => c.cityName === city.name && c.stateId === state.id
          ).limit(1);

          if (existing.length > 0) {
            skippedCount++;
            continue;
          }

          await db.insert(mepCities).values({
            stateId: state.id,
            cityName: city.name,
            tier: city.tier,
            baseCostResidential: city.residential.toString(),
            baseCostCommercial: city.commercial.toString(),
            baseCostIndustrial: city.industrial.toString(),
            mepPercentageResidential: "12",
            mepPercentageCommercial: "15",
            mepPercentageIndustrial: "13",
            climateZone: city.climate,
            climateAdjustment: city.climate === "hot-humid" ? "8" : city.climate === "cold" ? "-12" : "0",
            regionalMultiplier: "1.0",
            laborCostMultiplier: "1.0",
            isActive: true,
          });

          createdCount++;
          console.log(`✅ Added: ${city.name}, ${stateGroup.state}`);
        } catch (error: any) {
          if (error.code !== "ER_DUP_ENTRY") {
            console.error(`Error adding ${city.name}:`, error.message);
          }
        }
      }
    }

    console.log(`\n✨ City expansion completed!`);
    console.log(`📊 Created: ${createdCount} cities`);
    console.log(`⏭️  Skipped: ${skippedCount} (already exist)`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during expansion:", error);
    process.exit(1);
  }
}

expandCities();
