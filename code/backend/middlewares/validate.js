/**
 * Hand-written validation middleware.
 * Returns 400 for bad client input – controllers/services never see malformed data
 * and never return 500 for something the client should fix.
 */
'use strict';

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MAX_TEXT = 255;

/** Emit a 400 with an errors array. */
function fail(res, errors) {
  return res.status(400).json({ status: 'fail', errors });
}

/** Check a single string field: required, non-empty, max 255 chars. */
function checkText(value, field, errors, { required = true } = {}) {
  if (value === undefined || value === null) {
    if (required) errors.push({ field, message: `${field} is required.` });
    return;
  }
  if (typeof value !== 'string') {
    errors.push({ field, message: `${field} must be a string.` });
    return;
  }
  if (required && !value.trim()) {
    errors.push({ field, message: `${field} is required.` });
    return;
  }
  if (value.length > MAX_TEXT) {
    errors.push({ field, message: `${field} must be ${MAX_TEXT} characters or fewer.` });
  }
}

/** Positive integer check (string or number input). */
function isPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

// ── Generic ──────────────────────────────────────────────────────────────────

/**
 * validateIdParam(paramName?)
 *
 * Factory that returns a middleware validating a named route parameter.
 * Defaults to 'id' so existing routes that use :id need no changes.
 *
 * Usage:
 *   router.get('/api/customer/:id',              validateIdParam())
 *   router.get('/api/vehicles/:customer_id',     validateIdParam('customer_id'))
 */
function validateIdParam(paramName = 'id') {
  return function (req, res, next) {
    const value = req.params[paramName];
    if (!isPositiveInt(value)) {
      return fail(res, [{ field: paramName, message: `${paramName} must be a positive integer.` }]);
    }
    next();
  };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

function validateLogin(req, res, next) {
  const { employee_email, employee_password } = req.body || {};
  const errors = [];

  if (!employee_email || typeof employee_email !== 'string') {
    errors.push({ field: 'employee_email', message: 'Email is required.' });
  } else if (!EMAIL_RE.test(employee_email.trim())) {
    errors.push({ field: 'employee_email', message: 'Email format is invalid.' });
  }

  if (!employee_password || typeof employee_password !== 'string') {
    errors.push({ field: 'employee_password', message: 'Password is required.' });
  } else if (employee_password.length < 8) {
    errors.push({ field: 'employee_password', message: 'Password must be at least 8 characters.' });
  }

  if (errors.length) return fail(res, errors);
  next();
}

// ── Employees ─────────────────────────────────────────────────────────────────

function validateCreateEmployee(req, res, next) {
  const {
    employee_email, employee_first_name, employee_last_name,
    employee_phone, employee_password, company_role_id,
  } = req.body || {};
  const errors = [];

  if (!employee_email || typeof employee_email !== 'string') {
    errors.push({ field: 'employee_email', message: 'Email is required.' });
  } else if (!EMAIL_RE.test(employee_email.trim())) {
    errors.push({ field: 'employee_email', message: 'Email format is invalid.' });
  }

  checkText(employee_first_name, 'employee_first_name', errors);
  checkText(employee_last_name,  'employee_last_name',  errors);
  checkText(employee_phone,      'employee_phone',      errors);

  if (!employee_password || typeof employee_password !== 'string') {
    errors.push({ field: 'employee_password', message: 'Password is required.' });
  } else if (employee_password.length < 8) {
    errors.push({ field: 'employee_password', message: 'Password must be at least 8 characters.' });
  }

  const roleId = Number(company_role_id);
  if (company_role_id == null) {
    errors.push({ field: 'company_role_id', message: 'Role is required.' });
  } else if (![1, 2, 3].includes(roleId)) {
    errors.push({ field: 'company_role_id', message: 'Role must be 1 (Employee), 2 (Manager), or 3 (Admin).' });
  }

  if (errors.length) return fail(res, errors);
  next();
}

// ── Services ─────────────────────────────────────────────────────────────────

function validateCreateService(req, res, next) {
  const { service_name, service_description } = req.body || {};
  const errors = [];
  checkText(service_name,        'service_name',        errors, { required: true  });
  checkText(service_description, 'service_description', errors, { required: false });
  if (errors.length) return fail(res, errors);
  next();
}

function validateUpdateService(req, res, next) {
  const { service_id, service_name, service_description, active_service } = req.body || {};
  const errors = [];

  if (!service_id || !isPositiveInt(service_id)) {
    errors.push({ field: 'service_id', message: 'service_id must be a positive integer.' });
  }

  const hasUpdate =
    service_name !== undefined ||
    service_description !== undefined ||
    active_service !== undefined;
  if (!hasUpdate) {
    errors.push({ message: 'At least one of service_name, service_description, active_service must be provided.' });
  }

  if (service_name !== undefined)        checkText(service_name,        'service_name',        errors, { required: true  });
  if (service_description !== undefined) checkText(service_description, 'service_description', errors, { required: false });

  if (active_service !== undefined && ![0, 1].includes(Number(active_service))) {
    errors.push({ field: 'active_service', message: 'active_service must be 0 or 1.' });
  }

  if (errors.length) return fail(res, errors);
  next();
}

// ── Employee update ───────────────────────────────────────────────────────────

function validateUpdateEmployee(req, res, next) {
  const {
    employee_id, employee_first_name, employee_last_name,
    employee_phone, active_employee, company_role_id,
  } = req.body || {};
  const errors = [];

  if (!employee_id || !isPositiveInt(employee_id)) {
    errors.push({ field: 'employee_id', message: 'employee_id must be a positive integer.' });
  }

  const hasUpdate = [
    employee_first_name, employee_last_name, employee_phone,
    active_employee, company_role_id,
  ].some((v) => v !== undefined);
  if (!hasUpdate) {
    errors.push({ message: 'At least one field to update must be provided.' });
  }

  if (employee_first_name !== undefined) checkText(employee_first_name, 'employee_first_name', errors, { required: true });
  if (employee_last_name  !== undefined) checkText(employee_last_name,  'employee_last_name',  errors, { required: true });
  if (employee_phone      !== undefined) checkText(employee_phone,      'employee_phone',      errors, { required: true });

  if (active_employee !== undefined && ![0, 1].includes(Number(active_employee))) {
    errors.push({ field: 'active_employee', message: 'active_employee must be 0 or 1.' });
  }

  if (company_role_id !== undefined) {
    const roleId = Number(company_role_id);
    if (![1, 2, 3].includes(roleId)) {
      errors.push({ field: 'company_role_id', message: 'company_role_id must be 1, 2, or 3.' });
    }
  }

  if (errors.length) return fail(res, errors);
  next();
}

// ── Customers ────────────────────────────────────────────────────────────────

function validateCreateCustomer(req, res, next) {
  const {
    customer_email, customer_phone_number,
    customer_first_name, customer_last_name,
  } = req.body || {};
  const errors = [];

  if (!customer_email || typeof customer_email !== 'string') {
    errors.push({ field: 'customer_email', message: 'Email is required.' });
  } else if (!EMAIL_RE.test(customer_email.trim())) {
    errors.push({ field: 'customer_email', message: 'Email format is invalid.' });
  }

  checkText(customer_phone_number, 'customer_phone_number', errors);
  checkText(customer_first_name,   'customer_first_name',   errors);
  checkText(customer_last_name,    'customer_last_name',    errors);

  if (errors.length) return fail(res, errors);
  next();
}

function validateUpdateCustomer(req, res, next) {
  const {
    customer_id, customer_email, customer_phone_number,
    customer_first_name, customer_last_name, active_customer_status,
  } = req.body || {};
  const errors = [];

  if (!customer_id || !isPositiveInt(customer_id)) {
    errors.push({ field: 'customer_id', message: 'customer_id must be a positive integer.' });
  }

  const hasUpdate = [
    customer_email, customer_phone_number, customer_first_name,
    customer_last_name, active_customer_status,
  ].some((v) => v !== undefined);
  if (!hasUpdate) {
    errors.push({ message: 'At least one field to update must be provided.' });
  }

  if (customer_email !== undefined) {
    if (typeof customer_email !== 'string' || !EMAIL_RE.test(customer_email.trim())) {
      errors.push({ field: 'customer_email', message: 'Email format is invalid.' });
    }
  }
  if (customer_phone_number !== undefined) checkText(customer_phone_number, 'customer_phone_number', errors, { required: true });
  if (customer_first_name   !== undefined) checkText(customer_first_name,   'customer_first_name',   errors, { required: true });
  if (customer_last_name    !== undefined) checkText(customer_last_name,    'customer_last_name',    errors, { required: true });

  if (active_customer_status !== undefined && ![0, 1].includes(Number(active_customer_status))) {
    errors.push({ field: 'active_customer_status', message: 'active_customer_status must be 0 or 1.' });
  }

  if (errors.length) return fail(res, errors);
  next();
}

// ── Vehicles ─────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

function _validateVehicleFields(body, errors, requireCustomerId = false) {
  const {
    customer_id, vehicle_year, vehicle_make, vehicle_model,
    vehicle_type, vehicle_mileage, vehicle_tag, vehicle_serial, vehicle_color,
  } = body;

  if (requireCustomerId) {
    if (!customer_id || !isPositiveInt(customer_id)) {
      errors.push({ field: 'customer_id', message: 'customer_id must be a positive integer.' });
    }
  }

  if (vehicle_year === undefined || vehicle_year === null) {
    errors.push({ field: 'vehicle_year', message: 'vehicle_year is required.' });
  } else {
    const yr = Number(vehicle_year);
    if (!Number.isInteger(yr) || yr < 1950 || yr > CURRENT_YEAR + 1) {
      errors.push({ field: 'vehicle_year', message: `vehicle_year must be between 1950 and ${CURRENT_YEAR + 1}.` });
    }
  }

  if (vehicle_mileage === undefined || vehicle_mileage === null) {
    errors.push({ field: 'vehicle_mileage', message: 'vehicle_mileage is required.' });
  } else {
    const mi = Number(vehicle_mileage);
    if (!Number.isInteger(mi) || mi < 0) {
      errors.push({ field: 'vehicle_mileage', message: 'vehicle_mileage must be a non-negative integer.' });
    }
  }

  checkText(vehicle_make,   'vehicle_make',   errors);
  checkText(vehicle_model,  'vehicle_model',  errors);
  checkText(vehicle_type,   'vehicle_type',   errors);
  checkText(vehicle_tag,    'vehicle_tag',    errors);
  checkText(vehicle_serial, 'vehicle_serial', errors);
  checkText(vehicle_color,  'vehicle_color',  errors);
}

function validateCreateVehicle(req, res, next) {
  const errors = [];
  _validateVehicleFields(req.body || {}, errors, true);
  if (errors.length) return fail(res, errors);
  next();
}

function validateUpdateVehicle(req, res, next) {
  const { vehicle_id, ...rest } = req.body || {};
  const errors = [];

  if (!vehicle_id || !isPositiveInt(vehicle_id)) {
    errors.push({ field: 'vehicle_id', message: 'vehicle_id must be a positive integer.' });
  }

  const hasUpdate = Object.values(rest).some((v) => v !== undefined);
  if (!hasUpdate) {
    errors.push({ message: 'At least one vehicle field to update must be provided.' });
  }

  // Validate provided fields
  const toCheck = { vehicle_year: rest.vehicle_year, vehicle_mileage: rest.vehicle_mileage };

  if (rest.vehicle_year !== undefined) {
    const yr = Number(rest.vehicle_year);
    if (!Number.isInteger(yr) || yr < 1950 || yr > CURRENT_YEAR + 1) {
      errors.push({ field: 'vehicle_year', message: `vehicle_year must be between 1950 and ${CURRENT_YEAR + 1}.` });
    }
  }
  if (rest.vehicle_mileage !== undefined) {
    const mi = Number(rest.vehicle_mileage);
    if (!Number.isInteger(mi) || mi < 0) {
      errors.push({ field: 'vehicle_mileage', message: 'vehicle_mileage must be a non-negative integer.' });
    }
  }

  for (const field of ['vehicle_make', 'vehicle_model', 'vehicle_type', 'vehicle_tag', 'vehicle_serial', 'vehicle_color']) {
    if (rest[field] !== undefined) checkText(rest[field], field, errors, { required: true });
  }

  if (errors.length) return fail(res, errors);
  next();
}

// ── Orders ───────────────────────────────────────────────────────────────────

/** Check an optional TEXT field (no 255-char limit, just type check). */
function checkOptionalText(value, field, errors) {
  if (value === undefined || value === null) return;
  if (typeof value !== 'string') {
    errors.push({ field, message: `${field} must be a string.` });
  }
}

/** Validate service_ids: must be a non-empty array of positive integers. */
function validateServiceIds(service_ids, errors) {
  if (!service_ids || !Array.isArray(service_ids) || service_ids.length === 0) {
    errors.push({ field: 'service_ids', message: 'At least one service is required.' });
    return;
  }
  for (const sid of service_ids) {
    if (!isPositiveInt(sid)) {
      errors.push({ field: 'service_ids', message: 'All service_ids must be positive integers.' });
      return;
    }
  }
}

/** Validate a non-negative integer field. */
function validateNonNegInt(value, field, errors, { required = true } = {}) {
  if (value === undefined || value === null) {
    if (required) errors.push({ field, message: `${field} is required.` });
    return;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    errors.push({ field, message: `${field} must be a non-negative integer.` });
  }
}

/** Validate an optional ISO date string. */
function validateOptionalDate(value, field, errors) {
  if (value === undefined || value === null || value === '') return;
  if (typeof value !== 'string') {
    errors.push({ field, message: `${field} must be a date string.` });
    return;
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    errors.push({ field, message: `${field} must be a valid date.` });
  }
}

function validateCreateOrder(req, res, next) {
  const {
    customer_id, vehicle_id, employee_id, service_ids,
    order_total_price, estimated_completion_date,
    additional_request, notes_for_internal_use, notes_for_customer,
  } = req.body || {};
  const errors = [];

  if (!customer_id || !isPositiveInt(customer_id)) {
    errors.push({ field: 'customer_id', message: 'customer_id must be a positive integer.' });
  }
  if (!vehicle_id || !isPositiveInt(vehicle_id)) {
    errors.push({ field: 'vehicle_id', message: 'vehicle_id must be a positive integer.' });
  }
  if (!employee_id || !isPositiveInt(employee_id)) {
    errors.push({ field: 'employee_id', message: 'employee_id must be a positive integer.' });
  }

  validateServiceIds(service_ids, errors);
  validateNonNegInt(order_total_price, 'order_total_price', errors, { required: true });

  validateOptionalDate(estimated_completion_date, 'estimated_completion_date', errors);
  checkOptionalText(additional_request,       'additional_request',       errors);
  checkOptionalText(notes_for_internal_use,   'notes_for_internal_use',   errors);
  checkOptionalText(notes_for_customer,       'notes_for_customer',       errors);

  if (errors.length) return fail(res, errors);
  next();
}

function validateUpdateOrder(req, res, next) {
  const {
    order_id, employee_id, order_total_price, estimated_completion_date,
    additional_request, notes_for_internal_use, notes_for_customer,
    active_order, service_ids,
  } = req.body || {};
  const errors = [];

  if (!order_id || !isPositiveInt(order_id)) {
    errors.push({ field: 'order_id', message: 'order_id must be a positive integer.' });
  }

  const hasUpdate = [
    employee_id, order_total_price, estimated_completion_date,
    additional_request, notes_for_internal_use, notes_for_customer,
    active_order, service_ids,
  ].some((v) => v !== undefined);
  if (!hasUpdate) {
    errors.push({ message: 'At least one field to update must be provided.' });
  }

  if (employee_id !== undefined && !isPositiveInt(employee_id)) {
    errors.push({ field: 'employee_id', message: 'employee_id must be a positive integer.' });
  }
  if (order_total_price !== undefined) {
    validateNonNegInt(order_total_price, 'order_total_price', errors, { required: false });
  }
  if (estimated_completion_date !== undefined) validateOptionalDate(estimated_completion_date, 'estimated_completion_date', errors);
  if (additional_request       !== undefined) checkOptionalText(additional_request,       'additional_request',       errors);
  if (notes_for_internal_use   !== undefined) checkOptionalText(notes_for_internal_use,   'notes_for_internal_use',   errors);
  if (notes_for_customer        !== undefined) checkOptionalText(notes_for_customer,        'notes_for_customer',        errors);
  if (active_order !== undefined && ![0, 1].includes(Number(active_order))) {
    errors.push({ field: 'active_order', message: 'active_order must be 0 or 1.' });
  }
  if (service_ids !== undefined) validateServiceIds(service_ids, errors);

  if (errors.length) return fail(res, errors);
  next();
}

function validateOrderStatus(req, res, next) {
  const { order_status } = req.body || {};
  const errors = [];

  if (order_status === undefined || order_status === null) {
    errors.push({ field: 'order_status', message: 'order_status is required.' });
  } else if (![0, 1, 2].includes(Number(order_status))) {
    errors.push({ field: 'order_status', message: 'order_status must be 0 (Received), 1 (In Progress), or 2 (Completed).' });
  }

  if (errors.length) return fail(res, errors);
  next();
}

function validateOrderServiceUpdate(req, res, next) {
  const { service_id, service_completed } = req.body || {};
  const errors = [];

  if (!service_id || !isPositiveInt(service_id)) {
    errors.push({ field: 'service_id', message: 'service_id must be a positive integer.' });
  }
  if (service_completed === undefined || service_completed === null) {
    errors.push({ field: 'service_completed', message: 'service_completed is required.' });
  } else if (![0, 1].includes(Number(service_completed))) {
    errors.push({ field: 'service_completed', message: 'service_completed must be 0 or 1.' });
  }

  if (errors.length) return fail(res, errors);
  next();
}

module.exports = {
  validateIdParam,
  validateLogin,
  validateCreateEmployee,
  validateUpdateEmployee,
  validateCreateService,
  validateUpdateService,
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCreateVehicle,
  validateUpdateVehicle,
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderStatus,
  validateOrderServiceUpdate,
};
