#!/usr/bin/env node

/**
 * Script to create seo_audits table in the database
 * Run with: node create-seo-table.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not found');
  process.exit(1);
}

async function createSeoAuditsTable() {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    
    connection = await mysql.createConnection(DATABASE_URL);
    console.log('✅ Connected to database');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`seo_audits\` (
        \`id\` varchar(255) NOT NULL PRIMARY KEY,
        \`pagePath\` varchar(255) NOT NULL,
        \`score\` int NOT NULL,
        \`issues\` json NOT NULL,
        \`recommendations\` json NOT NULL,
        \`auditedAt\` bigint NOT NULL,
        \`createdAt\` bigint NOT NULL,
        \`updatedAt\` bigint NOT NULL,
        INDEX \`idx_pagePath\` (\`pagePath\`),
        INDEX \`idx_auditedAt\` (\`auditedAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('🔄 Creating seo_audits table...');
    await connection.execute(createTableSQL);
    console.log('✅ seo_audits table created successfully!');

    // Verify table was created
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'seo_audits'"
    );
    
    if (tables.length > 0) {
      console.log('✅ Verified: seo_audits table exists in database');
      console.log('\n🎉 All done! You can now use the SEO Recommendations feature.');
      console.log('   Go to Admin Panel > SEO Recommendations > Run Full Audit');
    } else {
      console.error('❌ Table creation failed - table not found');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createSeoAuditsTable();
