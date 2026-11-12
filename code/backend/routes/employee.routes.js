const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateCreateEmployee } = require('../middlewares/validate');

// Create employee – admin only, validated first
router.post(
  '/api/employee',
  [authMiddleware.verifyToken, authMiddleware.isAdmin, validateCreateEmployee],
  employeeController.createEmployee,
);

// Get all employees – admin only
router.get(
  '/api/employees',
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  employeeController.getAllEmployees,
);

module.exports = router;
