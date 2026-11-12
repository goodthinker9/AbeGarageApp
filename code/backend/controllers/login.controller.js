// Login controller
const loginService = require('../services/login.service');
const { SignJWT } = require('jose');

/**
 * POST /api/employee/login
 */
async function logIn(req, res, next) {
  try {
    const employeeData = req.body;
    const result = await loginService.logIn(employeeData);

    if (result.status === 'fail') {
      return res.status(403).json({
        status: result.status,
        message: result.message,
      });
    }

    const employee = result.data;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new SignJWT({
      employee_id:         employee.employee_id,
      employee_email:      employee.employee_email,
      employee_role:       employee.company_role_id,
      employee_first_name: employee.employee_first_name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    return res.status(200).json({
      status: 'success',
      message: 'Employee logged in successfully',
      data: { employee_token: token },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { logIn };
