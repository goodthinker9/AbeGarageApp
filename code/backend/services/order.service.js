// Order service – orders, order_info, order_services, order_status
'use strict';

const { query, getClient } = require('../config/db.config');
const { randomUUID } = require('crypto');

/**
 * Create a new order in ONE transaction.
 * Validates: customer active, vehicle belongs to customer, employee active,
 * every service active.  Throws { code: 'VALIDATION', ... } on failure.
 */
async function createOrder(data) {
  const {
    customer_id, vehicle_id, employee_id, service_ids,
    order_total_price, estimated_completion_date,
    additional_request, notes_for_internal_use, notes_for_customer,
  } = data;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Customer exists and is active
    const cust = await client.query(
      `SELECT c.customer_id FROM customer_identifier c
        JOIN customer_info ci ON c.customer_id = ci.customer_id
       WHERE c.customer_id = $1 AND ci.active_customer_status = 1`,
      [customer_id],
    );
    if (!cust.rows.length) {
      throw { code: 'VALIDATION', field: 'customer_id', message: 'Customer not found or inactive.' };
    }

    // 2. Vehicle exists AND belongs to that customer
    const veh = await client.query(
      'SELECT vehicle_id FROM customer_vehicle_info WHERE vehicle_id = $1 AND customer_id = $2',
      [vehicle_id, customer_id],
    );
    if (!veh.rows.length) {
      throw { code: 'VALIDATION', field: 'vehicle_id', message: 'Vehicle not found or does not belong to this customer.' };
    }

    // 3. Employee exists and is active
    const emp = await client.query(
      'SELECT employee_id FROM employee WHERE employee_id = $1 AND active_employee = 1',
      [employee_id],
    );
    if (!emp.rows.length) {
      throw { code: 'VALIDATION', field: 'employee_id', message: 'Employee not found or inactive.' };
    }

    // 4. Every service exists and is active
    for (const sid of service_ids) {
      const svc = await client.query(
        'SELECT service_id FROM common_services WHERE service_id = $1 AND active_service = 1',
        [sid],
      );
      if (!svc.rows.length) {
        throw { code: 'VALIDATION', field: 'service_ids', message: `Service ${sid} not found or inactive.` };
      }
    }

    // 5. Generate hash and insert
    const order_hash = randomUUID();

    const orderResult = await client.query(
      `INSERT INTO orders (employee_id, customer_id, vehicle_id, active_order, order_hash)
       VALUES ($1, $2, $3, 1, $4) RETURNING order_id`,
      [employee_id, customer_id, vehicle_id, order_hash],
    );
    const order_id = orderResult.rows[0].order_id;

    await client.query(
      `INSERT INTO order_info
         (order_id, order_total_price, estimated_completion_date,
          additional_request, notes_for_internal_use, notes_for_customer,
          additional_requests_completed)
       VALUES ($1, $2, $3, $4, $5, $6, 0)`,
      [
        order_id, Number(order_total_price),
        estimated_completion_date || null,
        additional_request || null,
        notes_for_internal_use || null,
        notes_for_customer || null,
      ],
    );

    for (const sid of service_ids) {
      await client.query(
        'INSERT INTO order_services (order_id, service_id, service_completed) VALUES ($1, $2, 0)',
        [order_id, sid],
      );
    }

    await client.query(
      'INSERT INTO order_status (order_id, order_status) VALUES ($1, 0)',
      [order_id],
    );

    await client.query('COMMIT');
    return { order_id, order_hash };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Paginated order list. Role 1 only sees their own orders. */
async function getAllOrders({ limit = 20, offset = 0, status, search, employee_id, employee_role } = {}) {
  const lim = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const off = Math.max(parseInt(offset, 10) || 0, 0);

  const params = [];
  const conditions = [];
  let idx = 1;

  // Role 1: only own orders
  if (Number(employee_role) === 1) {
    params.push(employee_id);
    conditions.push(`o.employee_id = $${idx++}`);
  }

  // Status filter
  if (status !== undefined && status !== '') {
    const s = Number(status);
    if ([0, 1, 2].includes(s)) {
      params.push(s);
      conditions.push(`COALESCE(os.order_status, 0) = $${idx++}`);
    }
  }

  // Search (escape ILIKE wildcards)
  if (search && search.trim()) {
    const escaped = search.trim()
      .replace(/\\/g, '\\\\')
      .replace(/%/g,  '\\%')
      .replace(/_/g,  '\\_');
    const pattern = `%${escaped}%`;
    params.push(pattern, pattern, pattern, pattern, pattern);
    conditions.push(`(
        ci.customer_first_name  ILIKE $${idx++} ESCAPE '\\'
     OR ci.customer_last_name   ILIKE $${idx++} ESCAPE '\\'
     OR c.customer_email         ILIKE $${idx++} ESCAPE '\\'
     OR c.customer_phone_number  ILIKE $${idx++} ESCAPE '\\'
     OR cvi.vehicle_tag          ILIKE $${idx++} ESCAPE '\\'
    )`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRows = await query(
    `SELECT COUNT(*) AS total
       FROM orders o
       JOIN customer_identifier c ON o.customer_id = c.customer_id
       JOIN customer_info ci ON c.customer_id = ci.customer_id
       JOIN customer_vehicle_info cvi ON o.vehicle_id = cvi.vehicle_id
       LEFT JOIN order_status os ON o.order_id = os.order_id
       ${where}`,
    params,
  );
  const total = parseInt(countRows[0].total, 10);

  const dataParams = [...params, lim, off];
  const rows = await query(
    `SELECT
       o.order_id, o.order_hash, o.order_date, o.active_order,
       ci.customer_first_name, ci.customer_last_name,
       cvi.vehicle_make, cvi.vehicle_model, cvi.vehicle_tag,
       ei.employee_first_name, ei.employee_last_name,
       COALESCE(os.order_status, 0) AS order_status,
       oi.order_total_price
     FROM orders o
     JOIN customer_identifier c ON o.customer_id = c.customer_id
     JOIN customer_info ci ON c.customer_id = ci.customer_id
     JOIN customer_vehicle_info cvi ON o.vehicle_id = cvi.vehicle_id
     JOIN employee e ON o.employee_id = e.employee_id
     JOIN employee_info ei ON e.employee_id = ei.employee_id
     LEFT JOIN order_status os ON o.order_id = os.order_id
     LEFT JOIN order_info oi ON o.order_id = oi.order_id
     ${where}
     ORDER BY o.order_id DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    dataParams,
  );

  return { data: rows, total };
}

/** Full order detail by id. Returns null if not found. */
async function getOrderById(order_id) {
  const rows = await query(
    `SELECT
       o.order_id, o.order_hash, o.order_date, o.active_order, o.employee_id,
       c.customer_id, c.customer_email, c.customer_phone_number,
       ci.customer_first_name, ci.customer_last_name,
       cvi.vehicle_id, cvi.vehicle_year, cvi.vehicle_make, cvi.vehicle_model,
       cvi.vehicle_type, cvi.vehicle_mileage, cvi.vehicle_tag,
       cvi.vehicle_serial, cvi.vehicle_color,
       ei.employee_first_name, ei.employee_last_name,
       oi.order_total_price, oi.estimated_completion_date, oi.completion_date,
       oi.additional_request, oi.notes_for_internal_use, oi.notes_for_customer,
       oi.additional_requests_completed,
       COALESCE(os.order_status, 0) AS order_status
     FROM orders o
     JOIN customer_identifier c ON o.customer_id = c.customer_id
     JOIN customer_info ci ON c.customer_id = ci.customer_id
     JOIN customer_vehicle_info cvi ON o.vehicle_id = cvi.vehicle_id
     JOIN employee e ON o.employee_id = e.employee_id
     JOIN employee_info ei ON e.employee_id = ei.employee_id
     LEFT JOIN order_info oi ON o.order_id = oi.order_id
     LEFT JOIN order_status os ON o.order_id = os.order_id
     WHERE o.order_id = $1`,
    [order_id],
  );
  if (!rows.length) return null;

  const order = rows[0];

  // Fetch services separately
  order.services = await query(
    `SELECT os.order_service_id, os.service_id, os.service_completed,
            cs.service_name, cs.service_description
       FROM order_services os
       JOIN common_services cs ON os.service_id = cs.service_id
      WHERE os.order_id = $1
      ORDER BY os.order_service_id`,
    [order_id],
  );

  return order;
}

/** Update order fields in a transaction. Returns updated order or null. */
async function updateOrder(data) {
  const {
    order_id, employee_id, order_total_price, estimated_completion_date,
    additional_request, notes_for_internal_use, notes_for_customer,
    active_order, service_ids,
  } = data;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const check = await client.query('SELECT order_id FROM orders WHERE order_id = $1', [order_id]);
    if (!check.rows.length) {
      await client.query('ROLLBACK');
      return null;
    }

    // Update orders table (employee, active_order)
    const orderSets = [];
    const orderParams = [];
    let idx = 1;
    if (employee_id !== undefined) {
      orderSets.push(`employee_id = $${idx++}`);
      orderParams.push(Number(employee_id));
    }
    if (active_order !== undefined) {
      orderSets.push(`active_order = $${idx++}`);
      orderParams.push(Number(active_order));
    }
    if (orderSets.length) {
      orderParams.push(order_id);
      await client.query(`UPDATE orders SET ${orderSets.join(', ')} WHERE order_id = $${idx}`, orderParams);
    }

    // Update order_info
    const infoSets = [];
    const infoParams = [];
    let jdx = 1;
    if (order_total_price !== undefined)        { infoSets.push(`order_total_price = $${jdx++}`);     infoParams.push(Number(order_total_price)); }
    if (estimated_completion_date !== undefined) { infoSets.push(`estimated_completion_date = $${jdx++}`); infoParams.push(estimated_completion_date || null); }
    if (additional_request !== undefined)       { infoSets.push(`additional_request = $${jdx++}`);    infoParams.push(additional_request || null); }
    if (notes_for_internal_use !== undefined)   { infoSets.push(`notes_for_internal_use = $${jdx++}`);infoParams.push(notes_for_internal_use || null); }
    if (notes_for_customer !== undefined)        { infoSets.push(`notes_for_customer = $${jdx++}`);    infoParams.push(notes_for_customer || null); }
    if (infoSets.length) {
      infoParams.push(order_id);
      await client.query(`UPDATE order_info SET ${infoSets.join(', ')} WHERE order_id = $${jdx}`, infoParams);
    }

    // Replace services if provided
    if (service_ids !== undefined && Array.isArray(service_ids)) {
      await client.query('DELETE FROM order_services WHERE order_id = $1', [order_id]);
      for (const sid of service_ids) {
        await client.query(
          'INSERT INTO order_services (order_id, service_id, service_completed) VALUES ($1, $2, 0)',
          [order_id, sid],
        );
      }
    }

    await client.query('COMMIT');
    return getOrderById(order_id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Update order status. Setting 2 sets completion_date; moving back from 2 clears it. */
async function updateOrderStatus(order_id, newStatus) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const current = await client.query('SELECT order_status FROM order_status WHERE order_id = $1', [order_id]);
    if (!current.rows.length) {
      await client.query('ROLLBACK');
      return null;
    }
    const oldStatus = current.rows[0].order_status;

    await client.query('UPDATE order_status SET order_status = $1 WHERE order_id = $2', [Number(newStatus), order_id]);

    if (Number(newStatus) === 2) {
      await client.query('UPDATE order_info SET completion_date = now() WHERE order_id = $1', [order_id]);
    } else if (oldStatus === 2) {
      await client.query('UPDATE order_info SET completion_date = NULL WHERE order_id = $1', [order_id]);
    }

    await client.query('COMMIT');
    return { order_id, order_status: Number(newStatus) };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Toggle a single service's completed flag on an order. */
async function updateOrderService(order_id, service_id, service_completed) {
  const rows = await query(
    `UPDATE order_services SET service_completed = $1
      WHERE order_id = $2 AND service_id = $3 RETURNING *`,
    [Number(service_completed), order_id, service_id],
  );
  return rows[0] || null;
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  updateOrderService,
};
