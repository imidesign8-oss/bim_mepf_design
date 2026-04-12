import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function createSeoTable() {
  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    
    console.log('🔄 Creating seo_audits table...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`seo_audits\` (
        \`id\` VARCHAR(255) NOT NULL PRIMARY KEY,
        \`pagePath\` VARCHAR(255) NOT NULL,
        \`score\` INT NOT NULL,
        \`issues\` JSON NOT NULL,
        \`recommendations\` JSON NOT NULL,
        \`auditedAt\` BIGINT NOT NULL,
        \`createdAt\` BIGINT NOT NULL,
        \`updatedAt\` BIGINT NOT NULL,
        INDEX \`idx_pagePath\` (\`pagePath\`),
        INDEX \`idx_auditedAt\` (\`auditedAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ seo_audits table created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

createSeoTable();
