import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function checkSeoData() {
  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM `seo_audits`');
    console.log('Rows in seo_audits:', rows[0].count);
    
    if (rows[0].count > 0) {
      const [data] = await connection.execute('SELECT id, pagePath, score FROM `seo_audits` LIMIT 5');
      console.log('Sample data:', data);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkSeoData();
