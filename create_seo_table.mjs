import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test'
});

const sql = `
CREATE TABLE IF NOT EXISTS seo_audits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pagePath VARCHAR(255) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  issues JSON,
  recommendations JSON,
  auditedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pagePath (pagePath),
  INDEX idx_auditedAt (auditedAt)
);
`;

try {
  await connection.execute(sql);
  console.log('seo_audits table created successfully');
} catch (error) {
  console.error('Error creating table:', error.message);
}

await connection.end();
