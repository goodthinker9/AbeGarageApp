/**
 * npm run db:setup
 *
 * Creates all tables (idempotent – uses CREATE TABLE IF NOT EXISTS)
 * and seeds the 3 company roles.
 * Run this ONCE against a fresh database, or whenever you need to
 * re-apply the schema (safe to re-run).
 */
'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set. Add it to code/backend/.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const sqlFile = path.join(__dirname, '../services/sql/initial-queries.sql');
  const sql = fs.readFileSync(sqlFile, 'utf-8');

  const client = await pool.connect();
  try {
    console.log('Running schema …');
    await client.query(sql);
    console.log('✓ Schema applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('db:setup failed:', err.message);
  process.exit(1);
});
