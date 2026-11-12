// PostgreSQL connection pool using pg
const { Pool } = require('pg');

// DATABASE_URL must be set; enforced at startup by app.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required by Supabase/Render
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Execute a parameterised SQL query.
 * @param {string} sql   - SQL string with $1, $2 … placeholders
 * @param {Array}  params - parameter values
 * @returns {Promise<Array>} rows
 */
async function query(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

/**
 * Obtain a raw client for multi-statement transactions.
 * Caller must call client.release() after use.
 */
async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient };
