// Employee service – PostgreSQL (pg)
const { query, getClient } = require('../config/db.config');
const bcrypt = require('bcrypt');

/**
 * Check whether an employee with the given email already exists.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
async function checkIfEmployeeExists(email) {
  const rows = await query(
    'SELECT employee_id FROM employee WHERE employee_email = $1',
    [email],
  );
  return rows.length > 0;
}

/**
 * Create a new employee inside a transaction.
 * Returns { employee_id } on success.
 * Throws on failure – the controller is responsible for handling the error.
 * @param {Object} employee
 * @returns {Promise<{ employee_id: number }>}
 */
async function createEmployee(employee) {
  const hashed = await bcrypt.hash(employee.employee_password, 12);
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Insert email into employee table
    const empResult = await client.query(
      'INSERT INTO employee (employee_email, active_employee) VALUES ($1, $2) RETURNING employee_id',
      [employee.employee_email, employee.active_employee ?? 1],
    );
    const employee_id = empResult.rows[0].employee_id;

    // 2. Insert employee_info
    await client.query(
      'INSERT INTO employee_info (employee_id, employee_first_name, employee_last_name, employee_phone) VALUES ($1, $2, $3, $4)',
      [employee_id, employee.employee_first_name, employee.employee_last_name, employee.employee_phone],
    );

    // 3. Insert password hash
    await client.query(
      'INSERT INTO employee_pass (employee_id, employee_password_hashed) VALUES ($1, $2)',
      [employee_id, hashed],
    );

    // 4. Insert role
    await client.query(
      'INSERT INTO employee_role (employee_id, company_role_id) VALUES ($1, $2)',
      [employee_id, employee.company_role_id],
    );

    await client.query('COMMIT');
    return { employee_id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err; // propagate to controller
  } finally {
    client.release();
  }
}

/**
 * Fetch a single employee record joined across all four tables.
 * Returns an array (0 or 1 rows).
 * @param {string} employee_email
 */
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
 * Fetch the most recent 10 employees.
 */
async function getAllEmployees() {
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
     LIMIT 10`,
  );
  return rows;
}

module.exports = {
  checkIfEmployeeExists,
  createEmployee,
  getEmployeeByEmail,
  getAllEmployees,
};
