// Employee service – PostgreSQL (pg)
'use strict';

const { query, getClient } = require('../config/db.config');
const bcrypt = require('bcrypt');

/** Check whether an employee with the given email already exists. */
async function checkIfEmployeeExists(email) {
  const rows = await query(
    'SELECT employee_id FROM employee WHERE employee_email = $1',
    [email],
  );
  return rows.length > 0;
}

/**
 * Create a new employee inside a transaction.
 * Returns { employee_id } on success. Throws on failure.
 */
async function createEmployee(employee) {
  const hashed = await bcrypt.hash(employee.employee_password, 12);
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const empResult = await client.query(
      'INSERT INTO employee (employee_email, active_employee) VALUES ($1, $2) RETURNING employee_id',
      [employee.employee_email, employee.active_employee ?? 1],
    );
    const employee_id = empResult.rows[0].employee_id;

    await client.query(
      'INSERT INTO employee_info (employee_id, employee_first_name, employee_last_name, employee_phone) VALUES ($1, $2, $3, $4)',
      [employee_id, employee.employee_first_name, employee.employee_last_name, employee.employee_phone],
    );
    await client.query(
      'INSERT INTO employee_pass (employee_id, employee_password_hashed) VALUES ($1, $2)',
      [employee_id, hashed],
    );
    await client.query(
      'INSERT INTO employee_role (employee_id, company_role_id) VALUES ($1, $2)',
      [employee_id, employee.company_role_id],
    );

    await client.query('COMMIT');
    return { employee_id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Full employee row joined across all four tables. Returns array (0 or 1 rows). */
async function getEmployeeByEmail(employee_email) {
  const rows = await query(
    `SELECT
       e.employee_id,
       e.employee_email,
       e.active_employee,
       e.added_date,
       ei.employee_first_name,
       ei.employee_last_name,
       ei.employee_phone,
       ep.employee_password_hashed,
       er.company_role_id
     FROM employee e
     JOIN employee_info ei ON e.employee_id = ei.employee_id
     JOIN employee_pass  ep ON e.employee_id = ep.employee_id
     JOIN employee_role  er ON e.employee_id = er.employee_id
     WHERE e.employee_email = $1`,
    [employee_email],
  );
  return rows;
}

/**
 * Lightweight auth query: fetch only what verifyToken needs.
 * Uses the indexed employee_id PK — one join, no password hash.
 * Returns { employee_id, active_employee, company_role_id } or null.
 */
async function getEmployeeForAuth(employee_id) {
  const rows = await query(
    `SELECT e.employee_id, e.active_employee, er.company_role_id
       FROM employee e
       JOIN employee_role er ON e.employee_id = er.employee_id
      WHERE e.employee_id = $1`,
    [employee_id],
  );
  return rows[0] || null;
}

/** Fetch a single employee by id (no password hash).
 * Returns null when not found.
 */
async function getEmployeeById(employee_id) {
  const rows = await query(
    `SELECT
       e.employee_id,
       e.employee_email,
       e.active_employee,
       e.added_date,
       ei.employee_first_name,
       ei.employee_last_name,
       ei.employee_phone,
       er.company_role_id,
       cr.company_role_name
     FROM employee e
     JOIN employee_info ei ON e.employee_id = ei.employee_id
     JOIN employee_role  er ON e.employee_id = er.employee_id
     JOIN company_roles  cr ON er.company_role_id = cr.company_role_id
     WHERE e.employee_id = $1`,
    [employee_id],
  );
  return rows[0] || null;
}

/**
 * Update employee fields inside a transaction.
 * Returns the updated row or null if not found.
 * Caller must already have validated that the requesting admin is not
 * demoting or deactivating their own account.
 */
async function updateEmployee({
  employee_id,
  employee_first_name,
  employee_last_name,
  employee_phone,
  active_employee,
  company_role_id,
}) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Verify the employee exists
    const check = await client.query(
      'SELECT employee_id FROM employee WHERE employee_id = $1',
      [employee_id],
    );
    if (!check.rows.length) {
      await client.query('ROLLBACK');
      return null;
    }

    // Update employee table
    if (active_employee !== undefined) {
      await client.query(
        'UPDATE employee SET active_employee = $1 WHERE employee_id = $2',
        [Number(active_employee), employee_id],
      );
    }

    // Update employee_info
    const infoSets   = [];
    const infoParams = [];
    let idx = 1;
    if (employee_first_name !== undefined) { infoSets.push(`employee_first_name = $${idx++}`); infoParams.push(employee_first_name.trim()); }
    if (employee_last_name  !== undefined) { infoSets.push(`employee_last_name  = $${idx++}`); infoParams.push(employee_last_name.trim());  }
    if (employee_phone      !== undefined) { infoSets.push(`employee_phone      = $${idx++}`); infoParams.push(employee_phone.trim());       }
    if (infoSets.length) {
      infoParams.push(employee_id);
      await client.query(
        `UPDATE employee_info SET ${infoSets.join(', ')} WHERE employee_id = $${idx}`,
        infoParams,
      );
    }

    // Update role
    if (company_role_id !== undefined) {
      await client.query(
        'UPDATE employee_role SET company_role_id = $1 WHERE employee_id = $2',
        [Number(company_role_id), employee_id],
      );
    }

    await client.query('COMMIT');
    return getEmployeeById(employee_id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Fetch employees with pagination. Returns { data, total }. */
async function getAllEmployees({ limit = 20, offset = 0 } = {}) {
  const lim = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const off = Math.max(parseInt(offset, 10) || 0, 0);

  const countRows = await query(
    'SELECT COUNT(*) AS total FROM employee',
  );
  const total = parseInt(countRows[0].total, 10);

  const rows = await query(
    `SELECT
       e.employee_id,
       e.employee_email,
       e.active_employee,
       e.added_date,
       ei.employee_first_name,
       ei.employee_last_name,
       ei.employee_phone,
       er.company_role_id,
       cr.company_role_name
     FROM employee e
     JOIN employee_info  ei ON e.employee_id = ei.employee_id
     JOIN employee_role  er ON e.employee_id = er.employee_id
     JOIN company_roles  cr ON er.company_role_id = cr.company_role_id
     ORDER BY e.employee_id DESC
     LIMIT $1 OFFSET $2`,
    [lim, off],
  );
  return { data: rows, total };
}

module.exports = {
  checkIfEmployeeExists,
  createEmployee,
  getEmployeeByEmail,
  getEmployeeById,
  getEmployeeForAuth,
  updateEmployee,
  getAllEmployees,
};
