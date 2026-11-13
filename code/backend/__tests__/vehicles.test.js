/**
 * Vehicle endpoints – auth gate and validation tests.
 * No live DB required.
 */
'use strict';

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'test-secret-at-least-32-chars-long!!';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://skip';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Mock employee service so verifyToken never touches the real DB.
jest.mock('../services/employee.service');
const employeeService = require('../services/employee.service');

beforeEach(() => {
  jest.resetAllMocks();
  employeeService.getEmployeeForAuth.mockResolvedValue({
    employee_id: 1,
    active_employee: 1,
    company_role_id: 2,  // manager – enough for vehicle routes
  });
});

const request = require('supertest');
const app     = require('../app');
const { SignJWT } = require('jose');

/** Helper: create a signed token with the test secret. */
async function makeToken(role = 2) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return new SignJWT({ employee_email: 'test@test.com', employee_role: role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

// ── GET /api/vehicles/:customer_id ───────────────────────────────────────────
describe('GET /api/vehicles/:customer_id — auth + validation', () => {
  it('returns 403 without token', async () => {
    const res = await request(app).get('/api/vehicles/1');
    expect(res.status).toBe(403);
  });
  it('returns 400 when customer_id is not a positive integer', async () => {
    const token = await makeToken();
    const res = await request(app)
      .get('/api/vehicles/xyz')
      .set('x-access-token', token);
    expect(res.status).toBe(400);
    // param is named customer_id, so the error field must reflect that
    expect(res.body.errors[0].field).toBe('customer_id');
  });
});

// ── POST /api/vehicle ────────────────────────────────────────────────────────
describe('POST /api/vehicle — validation', () => {
  it('returns 403 without token', async () => {
    const res = await request(app).post('/api/vehicle').send({});
    expect(res.status).toBe(403);
  });
  it('returns 400 when required fields are missing', async () => {
    const token = await makeToken();
    const res = await request(app)
      .post('/api/vehicle')
      .set('x-access-token', token)
      .send({ customer_id: 1 }); // missing year, make, model etc.
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('vehicle_year');
    expect(fields).toContain('vehicle_make');
  });
  it('returns 400 when vehicle_year is out of range', async () => {
    const token = await makeToken();
    const res = await request(app)
      .post('/api/vehicle')
      .set('x-access-token', token)
      .send({
        customer_id: 1, vehicle_year: 1900, vehicle_make: 'Ford',
        vehicle_model: 'F150', vehicle_type: 'Truck', vehicle_mileage: 0,
        vehicle_tag: 'AB1234', vehicle_serial: 'VIN123', vehicle_color: 'Blue',
      });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('vehicle_year');
  });
  it('returns 400 when vehicle_mileage is negative', async () => {
    const token = await makeToken();
    const year  = new Date().getFullYear();
    const res = await request(app)
      .post('/api/vehicle')
      .set('x-access-token', token)
      .send({
        customer_id: 1, vehicle_year: year, vehicle_make: 'Ford',
        vehicle_model: 'F150', vehicle_type: 'Truck', vehicle_mileage: -1,
        vehicle_tag: 'AB1234', vehicle_serial: 'VIN123', vehicle_color: 'Blue',
      });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('vehicle_mileage');
  });
  it('returns 400 when a text field exceeds 255 characters', async () => {
    const token = await makeToken();
    const year  = new Date().getFullYear();
    const res = await request(app)
      .post('/api/vehicle')
      .set('x-access-token', token)
      .send({
        customer_id: 1, vehicle_year: year,
        vehicle_make: 'F'.repeat(300), // too long
        vehicle_model: 'F150', vehicle_type: 'Truck', vehicle_mileage: 0,
        vehicle_tag: 'AB1234', vehicle_serial: 'VIN123', vehicle_color: 'Blue',
      });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('vehicle_make');
  });
});

// ── PUT /api/vehicle ─────────────────────────────────────────────────────────
describe('PUT /api/vehicle — validation', () => {
  it('returns 400 when vehicle_id is missing', async () => {
    const token = await makeToken();
    const res = await request(app)
      .put('/api/vehicle')
      .set('x-access-token', token)
      .send({ vehicle_color: 'Red' }); // no vehicle_id
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('vehicle_id');
  });
});
