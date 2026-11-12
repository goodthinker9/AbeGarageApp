/**
 * Hand-written validation middleware.
 * Returns 400 with a clear message for bad input so the caller never reaches
 * service/DB code with malformed data, and controllers never send 500 for
 * something the client should fix.
 */

'use strict';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Send a 400 with a list of field errors. */
function fail(res, errors) {
  return res.status(400).json({ status: 'fail', errors });
}

/**
 * Validate POST /api/employee/login
 * Required: employee_email (valid), employee_password (≥8 chars)
 */
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

/**
 * Validate POST /api/employee (create employee)
 * Required: employee_email, employee_first_name, employee_last_name,
 *           employee_phone, employee_password (≥8), company_role_id (1|2|3)
 */
function validateCreateEmployee(req, res, next) {
  const {
    employee_email,
    employee_first_name,
    employee_last_name,
    employee_phone,
    employee_password,
    company_role_id,
  } = req.body || {};

  const errors = [];

  if (!employee_email || typeof employee_email !== 'string') {
    errors.push({ field: 'employee_email', message: 'Email is required.' });
  } else if (!EMAIL_RE.test(employee_email.trim())) {
    errors.push({ field: 'employee_email', message: 'Email format is invalid.' });
  }

  if (!employee_first_name || !employee_first_name.toString().trim()) {
    errors.push({ field: 'employee_first_name', message: 'First name is required.' });
  }

  if (!employee_last_name || !employee_last_name.toString().trim()) {
    errors.push({ field: 'employee_last_name', message: 'Last name is required.' });
  }

  if (!employee_phone || !employee_phone.toString().trim()) {
    errors.push({ field: 'employee_phone', message: 'Phone number is required.' });
  }

  if (!employee_password || typeof employee_password !== 'string') {
    errors.push({ field: 'employee_password', message: 'Password is required.' });
  } else if (employee_password.length < 8) {
    errors.push({ field: 'employee_password', message: 'Password must be at least 8 characters.' });
  }

  const roleId = Number(company_role_id);
  if (!company_role_id && company_role_id !== 0) {
    errors.push({ field: 'company_role_id', message: 'Role is required.' });
  } else if (![1, 2, 3].includes(roleId)) {
    errors.push({ field: 'company_role_id', message: 'Role must be 1 (Employee), 2 (Manager), or 3 (Admin).' });
  }

  if (errors.length) return fail(res, errors);
  next();
}

/**
 * Validate POST /api/service (create service)
 * Required: service_name
 */
function validateCreateService(req, res, next) {
  const { service_name } = req.body || {};
  const errors = [];

  if (!service_name || !service_name.toString().trim()) {
    errors.push({ field: 'service_name', message: 'Service name is required.' });
  }

  if (errors.length) return fail(res, errors);
  next();
}

/**
 * Validate PUT /api/service (update service)
 * Required: service_id; at least one of service_name / service_description / active_service
 */
function validateUpdateService(req, res, next) {
  const { service_id, service_name, service_description, active_service } = req.body || {};
  const errors = [];

  if (!service_id) {
    errors.push({ field: 'service_id', message: 'service_id is required.' });
  }

  const hasUpdate =
    service_name !== undefined ||
    service_description !== undefined ||
    active_service !== undefined;

  if (!hasUpdate) {
    errors.push({ message: 'At least one field to update must be provided (service_name, service_description, active_service).' });
  }

  if (active_service !== undefined && ![0, 1].includes(Number(active_service))) {
    errors.push({ field: 'active_service', message: 'active_service must be 0 or 1.' });
  }

  if (errors.length) return fail(res, errors);
  next();
}

module.exports = {
  validateLogin,
  validateCreateEmployee,
  validateCreateService,
  validateUpdateService,
};
