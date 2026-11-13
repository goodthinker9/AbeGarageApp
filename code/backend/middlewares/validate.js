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
 * validateIdParam – use on any route with :id.
 * Rejects non-positive-integer path params with 400.
 */
function validateIdParam(req, res, next) {
  if (!isPositiveInt(req.params.id)) {
    return fail(res, [{ field: 'id', message: 'id must be a positive integer.' }]);
  }
  next();
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

module.exports = {
  validateIdParam,
  validateLogin,
  validateCreateEmployee,
  validateCreateService,
  validateUpdateService,
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCreateVehicle,
  validateUpdateVehicle,
};
