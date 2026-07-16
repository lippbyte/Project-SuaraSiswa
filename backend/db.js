import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'susi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
try {
  const connection = await pool.getConnection();
  console.log('✅ Connected to MySQL database successfully!');
  connection.release();
} catch (error) {
  console.error('❌ Failed to connect to MySQL database:', error.message);
  console.error('Verify your MySQL service is running and credentials in .env are correct.');
}

export default pool;
