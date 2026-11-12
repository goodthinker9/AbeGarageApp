// Auth middleware
require('dotenv').config();
const { jwtVerify } = require('jose');
const employeeService = require('../services/employee.service');

/**
 * Verify the JWT supplied in the x-access-token header.
 * Sets req.employee_email and req.employee_role on success.
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(403).json({ status: 'fail', message: 'No token provided.' });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    req.employee_email = payload.employee_email;
    req.employee_role  = payload.employee_role;   // cached from token
    next();
  } catch (err) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized.' });
  }
};

/**
 * Allow Admin only (company_role_id === 3).
 * Reads from the DB to get the latest role (not trusting the token alone).
 */
const isAdmin = async (req, res, next) => {
  try {
    const employees = await employeeService.getEmployeeByEmail(req.employee_email);
    if (employees.length === 0) {
      return res.status(403).json({ status: 'fail', message: 'Employee not found.' });
    }
    if (employees[0].company_role_id !== 3) {
      return res.status(403).json({ status: 'fail', message: 'Admin access required.' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Allow Manager or Admin (company_role_id 2 or 3).
 * Uses the role encoded in the JWT to avoid an extra DB round-trip on every
 * service/order read; the token already expires in 24 h.
 */
const isManagerOrAdmin = (req, res, next) => {
  const role = Number(req.employee_role);
  if (role === 2 || role === 3) {
    return next();
  }
  return res.status(403).json({ status: 'fail', message: 'Manager or Admin access required.' });
};

module.exports = { verifyToken, isAdmin, isManagerOrAdmin };
