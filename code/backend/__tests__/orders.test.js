/**
 * Order endpoints – validation, role gating, ownership, and status tests.
 * Fully mocked: no real DB required.
 */
'use strict';

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'test-secret-at-least-32-chars-long!!';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://skip';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

jest.mock('../services/employee.service');
const employeeService = require('../services/employee.service');
jest.mock('../services/order.service');
const orderService = require('../services/order.service');

const request  = require('supertest');
const app      = require('../app');
const { SignJWT } = require('jose');

async function makeToken({ employee_id = 10, role = 3 } = {}) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return new SignJWT({ employee_email: 'admin@test.com', employee_role: role, employee_id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

beforeEach(() => {
  jest.resetAllMocks();
  employeeService.getEmployeeForAuth.mockResolvedValue({
    employee_id: 10,
    active_employee: 1,
    company_role_id: 3,
  });
});

// ── POST /api/order ────────────────────────────────────────────────────────────
describe('POST /api/order', () => {
  it('returns 403 without token', async () => {
    const res = await request(app).post('/api/order').send({});
    expect(res.status).toBe(403);
  });

  it('returns 403 for role 1 (employee)', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 5, active_employee: 1, company_role_id: 1,
    });
    const token = await makeToken({ role: 1, employee_id: 5 });
    const res = await request(app).post('/api/order').set('x-access-token', token).send({});
    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    const token = await makeToken();
    const res = await request(app).post('/api/order').set('x-access-token', token).send({});
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('customer_id');
    expect(fields).toContain('vehicle_id');
    expect(fields).toContain('employee_id');
    expect(fields).toContain('service_ids');
    expect(fields).toContain('order_total_price');
  });

  it('returns 400 when service_ids is not a non-empty array', async () => {
    const token = await makeToken();
    const res = await request(app).post('/api/order').set('x-access-token', token).send({
      customer_id: 1, vehicle_id: 1, employee_id: 1,
      service_ids: [], order_total_price: 100,
    });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('service_ids');
  });

  it('returns 400 when order_total_price is negative', async () => {
    const token = await makeToken();
    const res = await request(app).post('/api/order').set('x-access-token', token).send({
      customer_id: 1, vehicle_id: 1, employee_id: 1,
      service_ids: [1], order_total_price: -50,
    });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('order_total_price');
  });

  it('returns 201 on valid input', async () => {
    orderService.createOrder.mockResolvedValue({ order_id: 1, order_hash: 'abc-123' });
    const token = await makeToken();
    const res = await request(app).post('/api/order').set('x-access-token', token).send({
      customer_id: 1, vehicle_id: 1, employee_id: 1,
      service_ids: [1, 2], order_total_price: 250,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.order_hash).toBe('abc-123');
  });

  it('returns 400 when service throws VALIDATION', async () => {
    orderService.createOrder.mockRejectedValue({ code: 'VALIDATION', field: 'customer_id', message: 'Customer not found or inactive.' });
    const token = await makeToken();
    const res = await request(app).post('/api/order').set('x-access-token', token).send({
      customer_id: 999, vehicle_id: 1, employee_id: 1,
      service_ids: [1], order_total_price: 100,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Customer not found/);
  });
});

// ── GET /api/orders ────────────────────────────────────────────────────────────
describe('GET /api/orders', () => {
  it('returns 403 without token', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(403);
  });

  it('returns 200 with {data, total} for role 1', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 5, active_employee: 1, company_role_id: 1,
    });
    orderService.getAllOrders.mockResolvedValue({ data: [], total: 0 });
    const token = await makeToken({ role: 1, employee_id: 5 });
    const res = await request(app).get('/api/orders').set('x-access-token', token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    // Verify role 1 filtering was passed
    expect(orderService.getAllOrders).toHaveBeenCalledWith(
      expect.objectContaining({ employee_id: 5, employee_role: 1 }),
    );
  });

  it('passes pagination and filter params', async () => {
    orderService.getAllOrders.mockResolvedValue({ data: [], total: 0 });
    const token = await makeToken();
    await request(app).get('/api/orders?limit=5&offset=10&status=1&search=john')
      .set('x-access-token', token);
    expect(orderService.getAllOrders).toHaveBeenCalledWith(
      expect.objectContaining({ limit: '5', offset: '10', status: '1', search: 'john' }),
    );
  });
});

// ── GET /api/order/:id ──────────────────────────────────────────────────────────
describe('GET /api/order/:id', () => {
  it('returns 400 for non-integer id', async () => {
    const token = await makeToken();
    const res = await request(app).get('/api/order/abc').set('x-access-token', token);
    expect(res.status).toBe(400);
  });

  it('returns 404 when order not found', async () => {
    orderService.getOrderById.mockResolvedValue(null);
    const token = await makeToken();
    const res = await request(app).get('/api/order/999').set('x-access-token', token);
    expect(res.status).toBe(404);
  });

  it('returns 403 when role 1 views another employee\'s order', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 5, active_employee: 1, company_role_id: 1,
    });
    orderService.getOrderById.mockResolvedValue({ order_id: 1, employee_id: 99 });
    const token = await makeToken({ role: 1, employee_id: 5 });
    const res = await request(app).get('/api/order/1').set('x-access-token', token);
    expect(res.status).toBe(403);
  });

  it('returns 200 when role 1 views their own order', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 5, active_employee: 1, company_role_id: 1,
    });
    orderService.getOrderById.mockResolvedValue({ order_id: 1, employee_id: 5, services: [] });
    const token = await makeToken({ role: 1, employee_id: 5 });
    const res = await request(app).get('/api/order/1').set('x-access-token', token);
    expect(res.status).toBe(200);
  });
});

// ── PUT /api/order ─────────────────────────────────────────────────────────────
describe('PUT /api/order', () => {
  it('returns 403 for role 1', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 5, active_employee: 1, company_role_id: 1,
    });
    const token = await makeToken({ role: 1, employee_id: 5 });
    const res = await request(app).put('/api/order').set('x-access-token', token).send({ order_id: 1 });
    expect(res.status).toBe(403);
  });

  it('returns 400 when order_id is missing', async () => {
    const token = await makeToken();
    const res = await request(app).put('/api/order').set('x-access-token', token).send({ order_total_price: 500 });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain('order_id');
  });

  it('returns 400 when no updatable field provided', async () => {
    const token = await makeToken();
    const res = await request(app).put('/api/order').set('x-access-token', token).send({ order_id: 5 });
    expect(res.status).toBe(400);
  });

  it('returns 200 on valid update', async () => {
    orderService.updateOrder.mockResolvedValue({ order_id: 5, order_total_price: 500 });
    const token = await makeToken();
    const res = await request(app).put('/api/order').set('x-access-token', token)
      .send({ order_id: 5, order_total_price: 500 });
    expect(res.status).toBe(200);
  });
});

// ── PUT /api/order/:id/status ─────────────────────────────────────────────────
describe('PUT /api/order/:id/status', () => {
  it('returns 400 for invalid status (3)', async () => {
    const token = await makeToken();
    const res = await request(app).put('/api/order/1/status').set('x-access-token', token)
      .send({ order_status: 3 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-integer :id', async () => {
    const token = await makeToken();
    const res = await request(app).put('/api/order/abc/status').set('x-access-token', token)
      .send({ order_status: 1 });
    expect(res.status).toBe(400);
  });

  it('returns 403 when role 1 updates another\'s order status', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 5, active_employee: 1, company_role_id: 1,
    });
    orderService.getOrderById.mockResolvedValue({ order_id: 1, employee_id: 99 });
    const token = await makeToken({ role: 1, employee_id: 5 });
    const res = await request(app).put('/api/order/1/status').set('x-access-token', token)
      .send({ order_status: 1 });
    expect(res.status).toBe(403);
  });

  it('returns 200 when role 1 updates own order status', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 5, active_employee: 1, company_role_id: 1,
    });
    orderService.getOrderById.mockResolvedValue({ order_id: 1, employee_id: 5, active_order: 1 });
    orderService.updateOrderStatus.mockResolvedValue({ order_id: 1, order_status: 2 });
    const token = await makeToken({ role: 1, employee_id: 5 });
    const res = await request(app).put('/api/order/1/status').set('x-access-token', token)
      .send({ order_status: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data.order_status).toBe(2);
  });
});

// ── PUT /api/order/:id/service ────────────────────────────────────────────────
describe('PUT /api/order/:id/service', () => {
  it('returns 400 when service_id missing', async () => {
    const token = await makeToken();
    const res = await request(app).put('/api/order/1/service').set('x-access-token', token)
      .send({ service_completed: 1 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when service_completed is not 0 or 1', async () => {
    const token = await makeToken();
    const res = await request(app).put('/api/order/1/service').set('x-access-token', token)
      .send({ service_id: 1, service_completed: 5 });
    expect(res.status).toBe(400);
  });

  it('returns 403 when role 1 updates another\'s order service', async () => {
    employeeService.getEmployeeForAuth.mockResolvedValue({
      employee_id: 5, active_employee: 1, company_role_id: 1,
    });
    orderService.getOrderById.mockResolvedValue({ order_id: 1, employee_id: 99 });
    const token = await makeToken({ role: 1, employee_id: 5 });
    const res = await request(app).put('/api/order/1/service').set('x-access-token', token)
      .send({ service_id: 1, service_completed: 1 });
    expect(res.status).toBe(403);
  });

  it('returns 200 on valid service toggle', async () => {
    orderService.getOrderById.mockResolvedValue({ order_id: 1, employee_id: 10, active_order: 1 });
    orderService.updateOrderService.mockResolvedValue({ order_service_id: 1, service_completed: 1 });
    const token = await makeToken();
    const res = await request(app).put('/api/order/1/service').set('x-access-token', token)
      .send({ service_id: 1, service_completed: 1 });
    expect(res.status).toBe(200);
  });

  it('returns 400 when updating status on a cancelled order', async () => {
    orderService.getOrderById.mockResolvedValue({ order_id: 1, employee_id: 10, active_order: 0 });
    const token = await makeToken();
    const res = await request(app).put('/api/order/1/status').set('x-access-token', token)
      .send({ order_status: 1 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cancelled/i);
  });

  it('returns 400 when toggling service on a cancelled order', async () => {
    orderService.getOrderById.mockResolvedValue({ order_id: 1, employee_id: 10, active_order: 0 });
    const token = await makeToken();
    const res = await request(app).put('/api/order/1/service').set('x-access-token', token)
      .send({ service_id: 1, service_completed: 1 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cancelled/i);
  });
});

// ── Duplicate service_ids ─────────────────────────────────────────────────────
describe('Duplicate service_ids', () => {
  it('POST /api/order returns 400 for duplicate service_ids', async () => {
    const token = await makeToken();
    const res = await request(app).post('/api/order').set('x-access-token', token).send({
      customer_id: 1, vehicle_id: 1, employee_id: 1,
      service_ids: [1, 1, 2], order_total_price: 100,
    });
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('service_ids');
  });

  it('PUT /api/order returns 400 for duplicate service_ids', async () => {
    const token = await makeToken();
    const res = await request(app).put('/api/order').set('x-access-token', token).send({
      order_id: 5, service_ids: [3, 3],
    });
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('service_ids');
  });
});

// ── updateOrder service diff (mocked) ─────────────────────────────────────────
describe('PUT /api/order — updateOrder with VALIDATION errors', () => {
  it('returns 400 when service throws VALIDATION for unknown employee', async () => {
    orderService.updateOrder.mockRejectedValue({ code: 'VALIDATION', field: 'employee_id', message: 'Employee not found or inactive.' });
    const token = await makeToken();
    const res = await request(app).put('/api/order').set('x-access-token', token)
      .send({ order_id: 5, employee_id: 999 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Employee not found/);
  });

  it('returns 400 when service throws VALIDATION for unknown service', async () => {
    orderService.updateOrder.mockRejectedValue({ code: 'VALIDATION', field: 'service_ids', message: 'Service 999 not found or inactive.' });
    const token = await makeToken();
    const res = await request(app).put('/api/order').set('x-access-token', token)
      .send({ order_id: 5, service_ids: [999] });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Service 999/);
  });
});
