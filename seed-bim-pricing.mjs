import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  console.log('Starting BIM LOD Pricing migration...');

  // Get all cities from the database
  const [cities] = await connection.query('SELECT id, cityName FROM mep_cities');
  
  console.log(`Found ${cities.length} cities. Populating BIM LOD pricing...`);

  // BIM pricing percentages by LOD level (as percentage of project cost)
  const bimPricingByLOD = {
    '100': { residential: 4.00, commercial: 4.50, industrial: 4.25 },  // Conceptual
    '200': { residential: 5.00, commercial: 5.50, industrial: 5.25 },  // Schematic
    '300': { residential: 6.00, commercial: 6.50, industrial: 6.25 },  // Design Development
    '400': { residential: 7.50, commercial: 8.00, industrial: 7.75 },  // Construction Documents
    '500': { residential: 9.00, commercial: 9.50, industrial: 9.25 },  // As-Built
  };

  let insertCount = 0;
  let skipCount = 0;

  for (const city of cities) {
    for (const [lod, pricing] of Object.entries(bimPricingByLOD)) {
      // Check if pricing already exists
      const [existing] = await connection.query(
        'SELECT id FROM bim_lod_pricing WHERE cityId = ? AND lodLevel = ?',
        [city.id, lod]
      );

      if (existing.length > 0) {
        skipCount++;
        continue;
      }

      // Insert new pricing
      await connection.query(
        `INSERT INTO bim_lod_pricing 
        (cityId, lodLevel, bimPercentageResidential, bimPercentageCommercial, bimPercentageIndustrial, description, isActive)
        VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          city.id,
          lod,
          pricing.residential,
          pricing.commercial,
          pricing.industrial,
          `BIM LOD ${lod} pricing for ${city.cityName}`
        ]
      );

      insertCount++;
    }
  }

  console.log(`✅ Migration complete!`);
  console.log(`   Inserted: ${insertCount} records`);
  console.log(`   Skipped: ${skipCount} records (already exist)`);

  // Verify the data
  const [count] = await connection.query(
    'SELECT COUNT(*) as total FROM bim_lod_pricing'
  );
  console.log(`   Total BIM LOD pricing records: ${count[0].total}`);

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  await connection.end();
}
