// Vehicle service – customer_vehicle_info table
'use strict';

const { query } = require('../config/db.config');

/** All vehicles for a customer. */
async function getVehiclesByCustomer(customer_id) {
  return query(
    'SELECT * FROM customer_vehicle_info WHERE customer_id = $1 ORDER BY vehicle_id DESC',
    [customer_id],
  );
}

/** Single vehicle by id. Returns null when not found. */
async function getVehicleById(vehicle_id) {
  const rows = await query(
    'SELECT * FROM customer_vehicle_info WHERE vehicle_id = $1',
    [vehicle_id],
  );
  return rows[0] || null;
}

/**
 * Create a vehicle.
 * Returns { vehicle_id }.
 * Throws when customer_id does not exist (FK violation → 404).
 */
async function createVehicle({
  customer_id, vehicle_year, vehicle_make, vehicle_model,
  vehicle_type, vehicle_mileage, vehicle_tag, vehicle_serial, vehicle_color,
}) {
  try {
    const rows = await query(
      `INSERT INTO customer_vehicle_info
         (customer_id, vehicle_year, vehicle_make, vehicle_model, vehicle_type,
          vehicle_mileage, vehicle_tag, vehicle_serial, vehicle_color)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING vehicle_id`,
      [
        customer_id, Number(vehicle_year), vehicle_make.trim(), vehicle_model.trim(),
        vehicle_type.trim(), Number(vehicle_mileage), vehicle_tag.trim(),
        vehicle_serial.trim(), vehicle_color.trim(),
      ],
    );
    return rows[0];
  } catch (err) {
    // FK violation: customer_id does not exist
    if (err.code === '23503') {
      throw { code: 'NOT_FOUND', message: 'Customer not found.' };
    }
    throw err;
  }
}

/**
 * Update a vehicle. Only provided fields are changed.
 * Returns the updated row or null if not found.
 */
async function updateVehicle({ vehicle_id, ...fields }) {
  const colMap = {
    vehicle_year:    (v) => Number(v),
    vehicle_make:    (v) => v.trim(),
    vehicle_model:   (v) => v.trim(),
    vehicle_type:    (v) => v.trim(),
    vehicle_mileage: (v) => Number(v),
    vehicle_tag:     (v) => v.trim(),
    vehicle_serial:  (v) => v.trim(),
    vehicle_color:   (v) => v.trim(),
  };

  const sets   = [];
  const params = [];
  let idx = 1;

  for (const [col, cast] of Object.entries(colMap)) {
    if (fields[col] !== undefined) {
      sets.push(`${col} = $${idx++}`);
      params.push(cast(fields[col]));
    }
  }

  if (!sets.length) return getVehicleById(vehicle_id);  // nothing to change

  params.push(vehicle_id);
  const rows = await query(
    `UPDATE customer_vehicle_info SET ${sets.join(', ')} WHERE vehicle_id = $${idx} RETURNING *`,
    params,
  );
  return rows[0] || null;
}

module.exports = { getVehiclesByCustomer, getVehicleById, createVehicle, updateVehicle };
