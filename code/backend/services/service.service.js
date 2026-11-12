// Service module – common_services table
'use strict';

const { query } = require('../config/db.config');

/** Return all ACTIVE services (public). */
async function getAllActiveServices() {
  return query(
    'SELECT service_id, service_name, service_description, active_service FROM common_services WHERE active_service = 1 ORDER BY service_id ASC',
  );
}

/** Return ALL services including inactive (staff only). */
async function getAllServices() {
  return query(
    'SELECT service_id, service_name, service_description, active_service FROM common_services ORDER BY service_id ASC',
  );
}

/** Return a single service by id (staff only). */
async function getServiceById(service_id) {
  const rows = await query(
    'SELECT service_id, service_name, service_description, active_service FROM common_services WHERE service_id = $1',
    [service_id],
  );
  return rows[0] || null;
}

/**
 * Create a new service.
 * @returns {Promise<{service_id: number}>}
 */
async function createService({ service_name, service_description }) {
  const rows = await query(
    'INSERT INTO common_services (service_name, service_description, active_service) VALUES ($1, $2, 1) RETURNING service_id',
    [service_name.trim(), service_description ? service_description.trim() : null],
  );
  return rows[0];
}

/**
 * Update an existing service. Only provided fields are changed.
 * Returns the updated row or null if not found.
 */
async function updateService({ service_id, service_name, service_description, active_service }) {
  // Build SET clause dynamically for only the provided fields
  const sets = [];
  const params = [];
  let idx = 1;

  if (service_name !== undefined) {
    sets.push(`service_name = $${idx++}`);
    params.push(service_name.trim());
  }
  if (service_description !== undefined) {
    sets.push(`service_description = $${idx++}`);
    params.push(service_description === null ? null : service_description.trim());
  }
  if (active_service !== undefined) {
    sets.push(`active_service = $${idx++}`);
    params.push(Number(active_service));
  }

  // sets.length is guaranteed ≥1 by validateUpdateService middleware
  params.push(service_id);
  const rows = await query(
    `UPDATE common_services SET ${sets.join(', ')} WHERE service_id = $${idx} RETURNING *`,
    params,
  );
  return rows[0] || null;
}

module.exports = {
  getAllActiveServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
};
