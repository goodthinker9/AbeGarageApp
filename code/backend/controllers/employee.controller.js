// Employee controller
const employeeService = require('../services/employee.service');

/**
 * POST /api/employee
 */
async function createEmployee(req, res, next) {
  try {
    const employeeExists = await employeeService.checkIfEmployeeExists(req.body.employee_email);
    if (employeeExists) {
      return res.status(400).json({
        error: 'This email address is already associated with another employee.',
      });
    }

    const employee = await employeeService.createEmployee(req.body);
    return res.status(200).json({ status: 'true', data: { employee_id: employee.employee_id } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/employees
 */
async function getAllEmployees(req, res, next) {
  try {
    const employees = await employeeService.getAllEmployees();
    return res.status(200).json({ status: 'success', data: employees });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEmployee, getAllEmployees };
