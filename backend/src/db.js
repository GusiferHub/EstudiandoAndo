import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl
});

export async function initDb() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS study_materials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      original_filename TEXT NOT NULL,
      summary JSONB NOT NULL,
      quiz JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function closeDb() {
  await pool.end();
}
