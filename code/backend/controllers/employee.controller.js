// Employee controller
'use strict';

const employeeService = require('../services/employee.service');

/** POST /api/employee */
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

/** GET /api/employees */
async function getAllEmployees(req, res, next) {
  try {
    const result = await employeeService.getAllEmployees(req.query);
    return res.status(200).json({ status: 'success', data: result.data, total: result.total });
  } catch (err) {
    next(err);
  }
}

/** GET /api/employee/:id */
async function getEmployeeById(req, res, next) {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ status: 'fail', message: 'Employee not found.' });
    }
    return res.status(200).json({ status: 'success', data: employee });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/employee */
async function updateEmployee(req, res, next) {
  try {
    const {
      employee_id, active_employee, company_role_id,
    } = req.body;

    // Prevent an admin from deactivating or demoting their own account
    if (Number(employee_id) === Number(req.employee_id)) {
      if (active_employee !== undefined && Number(active_employee) === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'You cannot deactivate your own account.',
        });
      }
      if (company_role_id !== undefined && Number(company_role_id) !== 3) {
        return res.status(400).json({
          status: 'fail',
          message: 'You cannot demote your own account from Admin.',
        });
      }
    }

    const updated = await employeeService.updateEmployee(req.body);
    if (!updated) {
      return res.status(404).json({ status: 'fail', message: 'Employee not found.' });
    }
    return res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEmployee, getAllEmployees, getEmployeeById, updateEmployee };
