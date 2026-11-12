// Login service – PostgreSQL (pg)
const bcrypt = require('bcrypt');
const employeeService = require('./employee.service');

/**
 * Validate credentials and return employee data.
 * Returns { status, message } on failure or { status: 'success', data } on success.
 * Throws on unexpected DB errors – controller is responsible for catching.
 * @param {{ employee_email: string, employee_password: string }} employeeData
 */
async function logIn(employeeData) {
  const employees = await employeeService.getEmployeeByEmail(employeeData.employee_email);

  if (employees.length === 0) {
    return { status: 'fail', message: 'Invalid credentials.' };
  }

  const employee = employees[0];

  // Reject inactive employees
  if (!employee.active_employee) {
    return { status: 'fail', message: 'Account is inactive. Contact an administrator.' };
  }

  const passwordMatch = await bcrypt.compare(
    employeeData.employee_password,
    employee.employee_password_hashed,
  );

  if (!passwordMatch) {
    // Generic message to avoid user enumeration
    return { status: 'fail', message: 'Invalid credentials.' };
  }

  return { status: 'success', data: employee };
}

module.exports = { logIn };
