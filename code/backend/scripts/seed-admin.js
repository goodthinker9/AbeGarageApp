/**
 * npm run seed:admin
 *
 * Creates the first admin employee.
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from .env (or the shell environment).
 * Refuses to run if either is missing – no hardcoded defaults.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=s3cr3t npm run seed:admin
 */
'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must both be set in .env or the environment.');
  console.error('  Example:  ADMIN_EMAIL=admin@garage.com ADMIN_PASSWORD=StrongPass1 npm run seed:admin');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if admin already exists
    const existing = await client.query(
      'SELECT employee_id FROM employee WHERE employee_email = $1',
      [ADMIN_EMAIL],
    );
    if (existing.rows.length > 0) {
      console.log(`Admin account already exists for ${ADMIN_EMAIL}. Nothing to do.`);
      await client.query('ROLLBACK');
      return;
    }

    // Hash password
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Insert employee record
    const empResult = await client.query(
      'INSERT INTO employee (employee_email, active_employee) VALUES ($1, 1) RETURNING employee_id',
      [ADMIN_EMAIL],
    );
    const employee_id = empResult.rows[0].employee_id;

    // Insert employee_info (placeholder name – change via the UI)
    await client.query(
      'INSERT INTO employee_info (employee_id, employee_first_name, employee_last_name, employee_phone) VALUES ($1, $2, $3, $4)',
      [employee_id, 'Admin', 'User', '000-000-0000'],
    );

    // Insert password hash
    await client.query(
      'INSERT INTO employee_pass (employee_id, employee_password_hashed) VALUES ($1, $2)',
      [employee_id, hashed],
    );

    // Look up Admin role id (3 by insert order, but query to be safe)
    const roleResult = await client.query(
      "SELECT company_role_id FROM company_roles WHERE company_role_name = 'Admin'",
    );
    if (roleResult.rows.length === 0) {
      throw new Error('Admin role not found. Run npm run db:setup first.');
    }
    const company_role_id = roleResult.rows[0].company_role_id;

    await client.query(
      'INSERT INTO employee_role (employee_id, company_role_id) VALUES ($1, $2)',
      [employee_id, company_role_id],
    );

    await client.query('COMMIT');
    console.log(`✓ Admin account created for ${ADMIN_EMAIL} (employee_id: ${employee_id})`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('seed:admin failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
