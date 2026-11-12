// Auth middleware
require('dotenv').config();
const { jwtVerify } = require('jose');
const employeeService = require('../services/employee.service');

/**
 * Verify the JWT supplied in the x-access-token header.
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
    next();
  } catch (err) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized.' });
  }
};

/**
 * Verify that the authenticated employee has the Admin role (company_role_id === 3).
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

module.exports = { verifyToken, isAdmin };
