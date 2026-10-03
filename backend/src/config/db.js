import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = process.env.DATABASE_URL ? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
}) : new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smartkos',
  ssl: process.env.DB_HOST?.includes('supabase') ? { rejectUnauthorized: false } : false
});

export default pool;
