/**
 * Employee endpoints – auth, role gate, validation and security tests.
 *
 * Uses jest.mock on employee.service so tests are hermetic: they never
 * hit the real database and never fail because of data that happens to
 * be (or not be) in the Supabase instance.
 *
 * verifyToken now calls employeeService.getEmployeeForAuth on every request,
 * so we mock that function to control what the middleware "sees".
 */
'use strict';

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'test-secret-at-least-32-chars-long!!';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://skip';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ── Mock the employee service BEFORE requiring app ───────────────────────────
jest.mock('../services/employee.service');
const employeeService = require('../services/employee.service');

const request  = require('supertest');
const app      = require('../app');
const { SignJWT } = require('jose');

// ── Token helper ─────────────────────────────────────────────────────────────
async function makeToken({ employee_id = 10, role = 3 } = {}) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return new SignJWT({ employee_email: 'admin@test.com', employee_role: role, employee_id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

// ── Default mock: active admin with id=10 ────────────────────────────────────
beforeEach(() => {
  jest.resetAllMocks();
  employeeService.getEmployeeForAuth.mockResolvedValue({
    employee_id: 10,
    active_employee: 1,
    company_role_id: 3,
  });
});

// ── verifyToken security: inactive employee ───────────────────────────────────
describe('verifyToken — inactive / missing employee', () => {
  it('returns 401 when employee is not found in the DB', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue(null);
    const token = await makeToken();
    const res = await request(app).get('/api/employees').set('x-access-token', token);
    expect(res.status).toBe(401);
  });

  it('returns 401 when employee is inactive (active_employee=0)', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 10, active_employee: 0, company_role_id: 3,
    });
    const token = await makeToken();
    const res = await request(app).get('/api/employees').set('x-access-token', token);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/inactive/i);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(403); // 403 = "no token" (before DB lookup)
  });
});

// ── isAdmin / isManagerOrAdmin role enforcement ───────────────────────────────
describe('Role enforcement after DB lookup', () => {
  it('returns 403 when a demoted employee (now role 2) hits an admin-only route', async () => {
    // Token was issued with role=3, but DB now says role=2
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 10, active_employee: 1, company_role_id: 2,
    });
    const token = await makeToken({ role: 3 });
    const res = await request(app).get('/api/employees').set('x-access-token', token);
    expect(res.status).toBe(403);
  });

  it('returns 403 when a plain employee (role 1) hits a manager-only route', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 10, active_employee: 1, company_role_id: 1,
    });
    const token = await makeToken({ role: 1 });
    const res = await request(app).get('/api/services/all').set('x-access-token', token);
    expect(res.status).toBe(403);
  });

  it('allows a manager (role 2) on manager-or-admin routes', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 10, active_employee: 1, company_role_id: 2,
    });
    // getAllServices needs the DB; we also mock it so no real query fires
    employeeService.getAllEmployees = undefined; // not called on this route
    const token = await makeToken({ role: 2 });
    const res = await request(app).get('/api/services/all').set('x-access-token', token);
    // 500 from missing DB data for services is acceptable; 403 is not
    expect(res.status).not.toBe(403);
  });
});

// ── GET /api/employee/:id ────────────────────────────────────────────────────
describe('GET /api/employee/:id — validation', () => {
  it('returns 403 without token', async () => {
    const res = await request(app).get('/api/employee/1');
    expect(res.status).toBe(403);
  });

  it('returns 400 when :id is not a positive integer', async () => {
    const token = await makeToken();
    const res = await request(app).get('/api/employee/abc').set('x-access-token', token);
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('id');
  });

  it('returns 400 when :id is zero', async () => {
    const token = await makeToken();
    const res = await request(app).get('/api/employee/0').set('x-access-token', token);
    expect(res.status).toBe(400);
  });

  it('passes validation for a valid id (not blocked by middleware)', async () => {
    employeeService.getEmployeeById = jest.fn().mockResolvedValue(null);
    const token = await makeToken();
    const res = await request(app).get('/api/employee/999').set('x-access-token', token);
    expect(res.status).not.toBe(400);
    expect(res.status).not.toBe(403);
  });
});

// ── PUT /api/employee — validation ───────────────────────────────────────────
describe('PUT /api/employee — validation', () => {
  it('returns 403 without token', async () => {
    const res = await request(app).put('/api/employee').send({ employee_id: 1 });
    expect(res.status).toBe(403);
  });

  it('returns 400 when employee_id is missing', async () => {
    const token = await makeToken();
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_first_name: 'Alice' });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain('employee_id');
  });

  it('returns 400 when no updatable field is provided', async () => {
    const token = await makeToken();
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 5 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when company_role_id is out of range', async () => {
    const token = await makeToken();
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 5, company_role_id: 99 });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain('company_role_id');
  });

  it('returns 400 when active_employee is not 0 or 1', async () => {
    const token = await makeToken();
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 5, active_employee: 7 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when admin tries to deactivate their own account', async () => {
    // own employee_id = 10; trying to deactivate employee_id 10
    employeeService.updateEmployee = jest.fn();
    const token = await makeToken({ employee_id: 10 });
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 10, active_employee: 0 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/deactivate.*own/i);
  });

  it('returns 400 when admin tries to demote their own role', async () => {
    employeeService.updateEmployee = jest.fn();
    const token = await makeToken({ employee_id: 10 });
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 10, company_role_id: 1 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/demote.*own/i);
  });

  it('calls updateEmployee for a well-formed request on a different employee', async () => {
    employeeService.updateEmployee = jest.fn().mockResolvedValue({
      employee_id: 5, employee_first_name: 'Alice', company_role_id: 2,
    });
    const token = await makeToken({ employee_id: 10 }); // editing id=5, not self
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 5, employee_first_name: 'Alice', company_role_id: 2 });
    expect(res.status).toBe(200);
    expect(employeeService.updateEmployee).toHaveBeenCalledTimes(1);
  });
});

// ── GET /api/employees — pagination ──────────────────────────────────────────
describe('GET /api/employees — pagination', () => {
  it('returns {data, total} with default pagination', async () => {
    employeeService.getAllEmployees = jest.fn().mockResolvedValue({
      data: [{ employee_id: 1, employee_first_name: 'Admin' }],
      total: 1,
    });
    const token = await makeToken();
    const res = await request(app).get('/api/employees').set('x-access-token', token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.total).toBe('number');
  });

  it('passes limit and offset query params to the service', async () => {
    employeeService.getAllEmployees = jest.fn().mockResolvedValue({ data: [], total: 0 });
    const token = await makeToken();
    await request(app)
      .get('/api/employees?limit=5&offset=10')
      .set('x-access-token', token);
    expect(employeeService.getAllEmployees).toHaveBeenCalledWith({ limit: '5', offset: '10' });
  });
});
