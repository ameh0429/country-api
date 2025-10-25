import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create countries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        capital VARCHAR(255),
        region VARCHAR(100),
        population BIGINT NOT NULL,
        currency_code VARCHAR(10),
        exchange_rate DECIMAL(20, 6),
        estimated_gdp DECIMAL(30, 2),
        flag_url TEXT,
        last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_region (region),
        INDEX idx_currency (currency_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Create metadata table for global refresh timestamp
    await connection.query(`
      CREATE TABLE IF NOT EXISTS metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Initialize last_refresh_timestamp if not exists
    await connection.query(`
      INSERT IGNORE INTO metadata (key_name, value)
      VALUES ('last_refresh_timestamp', NULL)
    `);

    connection.release();
    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('✗ Database initialization error:', error.message);
    throw error;
  }
};

export default pool;