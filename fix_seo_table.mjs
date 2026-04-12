import mysql from 'mysql2/promise';

// Get database connection details from environment or use defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test'
};

console.log('Connecting to database:', { ...dbConfig, password: '***' });

const connection = await mysql.createConnection(dbConfig);

try {
  // Drop existing table if it exists
  await connection.execute('DROP TABLE IF EXISTS seo_audits');
  console.log('Dropped existing seo_audits table');

  // Create table with Drizzle-compatible schema
  const sql = `
CREATE TABLE seo_audits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pagePath VARCHAR(255) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  issues JSON DEFAULT NULL,
  recommendations JSON DEFAULT NULL,
  auditedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pagePath (pagePath),
  INDEX idx_auditedAt (auditedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await connection.execute(sql);
  console.log('✅ seo_audits table created successfully');

  // Verify table exists
  const [tables] = await connection.execute('SHOW TABLES LIKE "seo_audits"');
  if (tables.length > 0) {
    console.log('✅ Table verified in database');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  await connection.end();
}
