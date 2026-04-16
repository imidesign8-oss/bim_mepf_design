import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL.split('@')[1].split('/')[0],
  user: process.env.DATABASE_URL.split('//')[1].split(':')[0],
  password: process.env.DATABASE_URL.split(':')[2].split('@')[0],
  database: process.env.DATABASE_URL.split('/').pop(),
});

try {
  // Check if quote_pricing_rules table exists
  const [tables] = await connection.execute(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quote_pricing_rules'"
  );
  
  console.log('quote_pricing_rules table exists:', tables.length > 0);
  
  if (tables.length === 0) {
    console.log('Table does not exist, creating it...');
    await connection.execute(`
      CREATE TABLE quote_pricing_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ruleName VARCHAR(255) NOT NULL,
        description LONGTEXT,
        basePrice DECIMAL(14, 2) NOT NULL,
        pricePerSqft DECIMAL(10, 2),
        simpleMultiplier DECIMAL(5, 2) DEFAULT '1.00' NOT NULL,
        moderateMultiplier DECIMAL(5, 2) DEFAULT '1.20' NOT NULL,
        complexMultiplier DECIMAL(5, 2) DEFAULT '1.50' NOT NULL,
        standardTimelineMultiplier DECIMAL(5, 2) DEFAULT '1.00' NOT NULL,
        fastTrackMultiplier DECIMAL(5, 2) DEFAULT '1.30' NOT NULL,
        isActive BOOLEAN DEFAULT true NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log('Table created successfully');
    
    // Insert default pricing rule
    await connection.execute(`
      INSERT INTO quote_pricing_rules (
        ruleName, description, basePrice, pricePerSqft, 
        simpleMultiplier, moderateMultiplier, complexMultiplier,
        standardTimelineMultiplier, fastTrackMultiplier, isActive
      ) VALUES (
        'Default Pricing', 'Default pricing rule for BIM & MEP services',
        50000, 5.00,
        1.00, 1.20, 1.50,
        1.00, 1.30, true
      )
    `);
    console.log('Default pricing rule inserted');
  } else {
    console.log('Table exists, checking columns...');
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quote_pricing_rules'"
    );
    console.log('Columns:', columns.map(c => c.COLUMN_NAME));
    
    // Check if isActive column exists
    const hasIsActive = columns.some(c => c.COLUMN_NAME === 'isActive');
    if (!hasIsActive) {
      console.log('Adding missing isActive column...');
      await connection.execute(`
        ALTER TABLE quote_pricing_rules ADD COLUMN isActive BOOLEAN DEFAULT true NOT NULL
      `);
      console.log('isActive column added');
    }
  }
  
  // Check quote_requests table
  const [quoteRequestsTables] = await connection.execute(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quote_requests'"
  );
  
  console.log('\nquote_requests table exists:', quoteRequestsTables.length > 0);
  
  if (quoteRequestsTables.length > 0) {
    const [qrColumns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quote_requests'"
    );
    console.log('quote_requests columns:', qrColumns.map(c => c.COLUMN_NAME));
  }
  
  console.log('\nDatabase check completed successfully!');
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await connection.end();
}
