// Customer service – customer_identifier + customer_info tables
'use strict';

const { query, getClient } = require('../config/db.config');
const { randomUUID } = require('crypto');

/**
 * List customers with optional ILIKE search across first/last name, email, phone.
 * Returns { data: [...], total: N }.
 */
async function getAllCustomers({ search = '', limit = 20, offset = 0 } = {}) {
  const lim = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const off = Math.max(parseInt(offset, 10) || 0, 0);

  let whereClause = '';
  const params = [];

  if (search && search.trim()) {
    // Escape ILIKE special characters so a literal % or _ in the search term
    // matches itself and does not act as a wildcard.
    const escaped = search.trim()
      .replace(/\\/g, '\\\\')   // backslash first
      .replace(/%/g,  '\\%')    // percent wildcard
      .replace(/_/g,  '\\_');   // underscore wildcard
    const pattern = `%${escaped}%`;
    params.push(pattern, pattern, pattern, pattern);
    whereClause = `
      WHERE (ci.customer_first_name  ILIKE $1 ESCAPE '\\'
          OR ci.customer_last_name   ILIKE $2 ESCAPE '\\'
          OR c.customer_email        ILIKE $3 ESCAPE '\\'
          OR c.customer_phone_number ILIKE $4 ESCAPE '\\')`;
  }

  const countParams = [...params];
  const countRows = await query(
    `SELECT COUNT(*) AS total
       FROM customer_identifier c
       JOIN customer_info ci ON c.customer_id = ci.customer_id
     ${whereClause}`,
    countParams,
  );
  const total = parseInt(countRows[0].total, 10);

  const dataParams = [...params, lim, off];
  const rows = await query(
    `SELECT
       c.customer_id,
       c.customer_email,
       c.customer_phone_number,
       c.customer_added_date,
       ci.customer_first_name,
       ci.customer_last_name,
       ci.active_customer_status
     FROM customer_identifier c
     JOIN customer_info ci ON c.customer_id = ci.customer_id
     ${whereClause}
     ORDER BY c.customer_id DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    dataParams,
  );

  return { data: rows, total };
}

/**
 * Get a single customer by id, plus their vehicles.
 * Returns null when not found.
 */
async function getCustomerById(customer_id) {
  const customers = await query(
    `SELECT
       c.customer_id,
       c.customer_email,
       c.customer_phone_number,
       c.customer_added_date,
       c.customer_hash,
       ci.customer_first_name,
       ci.customer_last_name,
       ci.active_customer_status
     FROM customer_identifier c
     JOIN customer_info ci ON c.customer_id = ci.customer_id
     WHERE c.customer_id = $1`,
    [customer_id],
  );
  if (!customers.length) return null;

  const vehicles = await query(
    `SELECT * FROM customer_vehicle_info WHERE customer_id = $1 ORDER BY vehicle_id DESC`,
    [customer_id],
  );

  // Also fetch the customer's orders (id, date, status) for the customer detail page
  const orders = await query(
    `SELECT o.order_id, o.order_date, o.active_order,
            COALESCE(os.order_status, 0) AS order_status
       FROM orders o
       LEFT JOIN order_status os ON o.order_id = os.order_id
      WHERE o.customer_id = $1
      ORDER BY o.order_id DESC`,
    [customer_id],
  );

  return { ...customers[0], vehicles, orders };
}

/**
 * Create a new customer (customer_identifier + customer_info) in one transaction.
 * Throws an object { code, message } on duplicate email/phone.
 */
async function createCustomer({ customer_email, customer_phone_number, customer_first_name, customer_last_name }) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const hash = randomUUID();
    const result = await client.query(
      `INSERT INTO customer_identifier
         (customer_email, customer_phone_number, customer_hash)
       VALUES ($1, $2, $3)
       RETURNING customer_id`,
      [customer_email.trim().toLowerCase(), customer_phone_number.trim(), hash],
    );
    const customer_id = result.rows[0].customer_id;

    await client.query(
      `INSERT INTO customer_info
         (customer_id, customer_first_name, customer_last_name, active_customer_status)
       VALUES ($1, $2, $3, 1)`,
      [customer_id, customer_first_name.trim(), customer_last_name.trim()],
    );

    await client.query('COMMIT');
    return { customer_id };
  } catch (err) {
    await client.query('ROLLBACK');
    // Postgres unique-violation code
    if (err.code === '23505') {
      const field = err.detail && err.detail.includes('customer_email')
        ? 'customer_email'
        : 'customer_phone_number';
      const dup = { code: 'DUPLICATE', field, message: `A customer with that ${field.replace('customer_', '').replace('_', ' ')} already exists.` };
      throw dup;
    }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update a customer's editable fields. Only provided fields are changed.
 * Returns the updated customer row or null if not found.
 * Throws { code: 'DUPLICATE' } on unique violation.
 */
async function updateCustomer({ customer_id, customer_email, customer_phone_number, customer_first_name, customer_last_name, active_customer_status }) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Update customer_identifier if email or phone provided
    const idSets = [];
    const idParams = [];
    let idx = 1;
    if (customer_email !== undefined) {
      idSets.push(`customer_email = $${idx++}`);
      idParams.push(customer_email.trim().toLowerCase());
    }
    if (customer_phone_number !== undefined) {
      idSets.push(`customer_phone_number = $${idx++}`);
      idParams.push(customer_phone_number.trim());
    }
    if (idSets.length) {
      idParams.push(customer_id);
      await client.query(
        `UPDATE customer_identifier SET ${idSets.join(', ')} WHERE customer_id = $${idx}`,
        idParams,
      );
    }

    // Update customer_info if any info fields provided
    const infoSets = [];
    const infoParams = [];
    let jdx = 1;
    if (customer_first_name !== undefined) {
      infoSets.push(`customer_first_name = $${jdx++}`);
      infoParams.push(customer_first_name.trim());
    }
    if (customer_last_name !== undefined) {
      infoSets.push(`customer_last_name = $${jdx++}`);
      infoParams.push(customer_last_name.trim());
    }
    if (active_customer_status !== undefined) {
      infoSets.push(`active_customer_status = $${jdx++}`);
      infoParams.push(Number(active_customer_status));
    }
    if (infoSets.length) {
      infoParams.push(customer_id);
      await client.query(
        `UPDATE customer_info SET ${infoSets.join(', ')} WHERE customer_id = $${jdx}`,
        infoParams,
      );
    }

    await client.query('COMMIT');

    // Return fresh data
    return getCustomerById(customer_id);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      const field = err.detail && err.detail.includes('customer_email')
        ? 'customer_email'
        : 'customer_phone_number';
      throw { code: 'DUPLICATE', field, message: `A customer with that ${field.replace('customer_', '').replace('_', ' ')} already exists.` };
    }
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer };
