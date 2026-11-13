// Auth middleware
'use strict';

require('dotenv').config();
const { jwtVerify } = require('jose');
const employeeService = require('../services/employee.service');

/**
 * verifyToken – stage 1 of every protected route.
 *
 * 1. Decode and verify the JWT signature.
 * 2. Load the employee from the DB by employee_id (from the token).
 *    - Returns 401 if the employee no longer exists.
 *    - Returns 401 if active_employee = 0 (account deactivated).
 * 3. Set req.employee_id and req.employee_role from the DB row
 *    so downstream middleware always see the *current* role, not the
 *    role that was baked into the token at login time.
 *
 * One indexed query (PK lookup + single join) – negligible overhead.
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(403).json({ status: 'fail', message: 'No token provided.' });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let payload;
    try {
      ({ payload } = await jwtVerify(token, secret));
    } catch {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized.' });
    }

    // Load fresh employee data – role and active status from the DB
    const emp = await employeeService.getEmployeeForAuth(payload.employee_id);

    if (!emp) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized.' });
    }
    if (!emp.active_employee) {
      return res.status(401).json({ status: 'fail', message: 'Account is inactive.' });
    }

    // Populate req from DB values (not from the token)
    req.employee_id    = emp.employee_id;
    req.employee_role  = emp.company_role_id;
    req.employee_email = payload.employee_email; // kept for legacy callers
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * isAdmin – role 3 only.
 * verifyToken has already set req.employee_role from the DB; no extra query.
 */
const isAdmin = (req, res, next) => {
  if (Number(req.employee_role) === 3) return next();
  return res.status(403).json({ status: 'fail', message: 'Admin access required.' });
};

/**
 * isManagerOrAdmin – roles 2 or 3.
 * verifyToken has already set req.employee_role from the DB; no extra query.
 */
const isManagerOrAdmin = (req, res, next) => {
  const role = Number(req.employee_role);
  if (role === 2 || role === 3) return next();
  return res.status(403).json({ status: 'fail', message: 'Manager or Admin access required.' });
};

module.exports = { verifyToken, isAdmin, isManagerOrAdmin };
