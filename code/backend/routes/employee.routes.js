const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateCreateEmployee, validateUpdateEmployee, validateIdParam } = require('../middlewares/validate');

// Create employee – token + admin check + validation
router.post(
  '/api/employee',
  [authMiddleware.verifyToken, authMiddleware.isAdmin, validateCreateEmployee],
  employeeController.createEmployee,
);

// Get all employees – token + admin check
router.get(
  '/api/employees',
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  employeeController.getAllEmployees,
);

// Get single employee by id – token first, then param validation, then DB-based admin check
// (validateIdParam before isAdmin so a bad :id returns 400, not 500)
router.get(
  '/api/employee/:id',
  [authMiddleware.verifyToken, validateIdParam(), authMiddleware.isAdmin],
  employeeController.getEmployeeById,
);

// Update employee – token first, body validation, then DB-based admin check
// (validateUpdateEmployee before isAdmin so bad input returns 400, not 500)
router.put(
  '/api/employee',
  [authMiddleware.verifyToken, validateUpdateEmployee, authMiddleware.isAdmin],
  employeeController.updateEmployee,
);

module.exports = router;
