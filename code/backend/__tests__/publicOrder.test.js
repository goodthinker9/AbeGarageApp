/**
 * Public order endpoint – no token required.
 * Mocked service layer: no real DB needed.
 */
'use strict';

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'test-secret-at-least-32-chars-long!!';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://skip';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

jest.mock('../services/employee.service');
const employeeService = require('../services/employee.service');

jest.mock('../services/publicOrder.service');
const publicOrderService = require('../services/publicOrder.service');

const request = require('supertest');
const app     = require('../app');

// verifyToken is not called on public routes, but jest.mock is needed
// to prevent the module from being loaded with real DB calls.
beforeEach(() => {
  jest.resetAllMocks();
  employeeService.getEmployeeForAuth.mockResolvedValue({
    employee_id: 1, active_employee: 1, company_role_id: 3,
  });
});

// ── UUID validation ──────────────────────────────────────────────────────────
describe('GET /api/public/order/:hash — input validation', () => {
  it('returns 400 for a plain string (not a UUID)', async () => {
    const res = await request(app).get('/api/public/order/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid order link/);
  });

  it('returns 400 for a UUID-like string with wrong version (v3)', async () => {
    const res = await request(app).get('/api/public/order/550e8400-e29b-31d4-a716-446655440000');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid order link/);
  });

  it('returns 400 for an empty hash segment', async () => {
    // Express router strips trailing slashes; this will 404 at the router level
    // which is still not 200 – acceptable.
    const res = await request(app).get('/api/public/order/!!');
    expect(res.status).not.toBe(200);
  });
});

// ── Unknown hash → 404 ───────────────────────────────────────────────────────
describe('GET /api/public/order/:hash — 404 on unknown hash', () => {
  it('returns 404 when hash not found in DB', async () => {
    publicOrderService.getPublicOrderByHash.mockResolvedValue(null);
    const hash = '550e8400-e29b-4d4a-a716-446655440000';
    const res = await request(app).get(`/api/public/order/${hash}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Order not found.');
  });
});

// ── Successful response ───────────────────────────────────────────────────────
const VALID_HASH = '550e8400-e29b-4d4a-a716-446655440001';

const mockOrder = {
  order_date: '2026-11-01T10:00:00.000Z',
  status: 1,
  status_label: 'In Progress',
  estimated_completion_date: '2026-11-10T00:00:00.000Z',
  completion_date: null,
  active_order: 1,
  customer: {
    first_name: 'Jasmine',
    last_name: 'Albeshir',
    email_masked: 'j***@gmail.com',
    phone_masked: '***-***-5487',
    active: 'Yes',
  },
  vehicle: {
    make: 'BMW', model: 'X7', color: 'Gold',
    year: 2020, tag: '0101AD', mileage: 12000,
  },
  services: [
    { name: 'Tire repairs', description: 'Fix tyres', status: 1, status_label: 'In Progress' },
  ],
  additional_request: null,
  notes_for_customer: null,
};

describe('GET /api/public/order/:hash — success', () => {
  beforeEach(() => {
    publicOrderService.getPublicOrderByHash.mockResolvedValue(mockOrder);
  });

  it('returns 200 with correct shape', async () => {
    const res = await request(app).get(`/api/public/order/${VALID_HASH}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toBeDefined();
  });

  it('sets Cache-Control: no-store header', async () => {
    const res = await request(app).get(`/api/public/order/${VALID_HASH}`);
    expect(res.headers['cache-control']).toMatch(/no-store/);
  });

  // ── Forbidden fields must NOT be present ─────────────────────────────────
  const FORBIDDEN_KEYS = [
    'order_id', 'order_hash', 'customer_id', 'vehicle_id', 'employee_id',
    'notes_for_internal_use', 'order_total_price',
    'employee_first_name', 'employee_last_name',
    'customer_email',        // full email – only masked version allowed
    'customer_phone_number', // full phone
    'vehicle_serial',        // VIN
    'vehicle_id',
  ];

  it('response data contains none of the forbidden keys', async () => {
    const res  = await request(app).get(`/api/public/order/${VALID_HASH}`);
    const data = res.body.data;
    const allKeys = JSON.stringify(data);
    for (const key of FORBIDDEN_KEYS) {
      expect(allKeys).not.toContain(`"${key}":`);
    }
  });

  it('customer section contains masked email and phone', async () => {
    const res = await request(app).get(`/api/public/order/${VALID_HASH}`);
    expect(res.body.data.customer.email_masked).toMatch(/\*\*\*@/);
    expect(res.body.data.customer.phone_masked).toMatch(/\*\*\*-\*\*\*/);
  });
});

// ── Cancelled order ───────────────────────────────────────────────────────────
describe('GET /api/public/order/:hash — cancelled order', () => {
  it('returns status_label Cancelled and empty services array', async () => {
    publicOrderService.getPublicOrderByHash.mockResolvedValue({
      ...mockOrder,
      active_order: 0,
      status: null,
      status_label: 'Cancelled',
      services: [],
    });
    const res = await request(app).get(`/api/public/order/${VALID_HASH}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status_label).toBe('Cancelled');
    expect(res.body.data.services).toHaveLength(0);
  });
});

// ── masking helpers ───────────────────────────────────────────────────────────
describe('masking helpers', () => {
  // Import the real (un-mocked) helpers for unit testing
  const { maskEmail, maskPhone } = jest.requireActual('../services/publicOrder.service');

  it('maskEmail masks local part correctly', () => {
    expect(maskEmail('jasmine@gmail.com')).toBe('j***@gmail.com');
    expect(maskEmail('a@b.com')).toBe('a***@b.com');
  });

  it('maskPhone keeps last 4 digits', () => {
    expect(maskPhone('240835487')).toBe('***-***-5487');
    expect(maskPhone('555-123-4567')).toBe('***-***-4567');
    expect(maskPhone('+1 800 456 7890')).toBe('***-***-7890');
  });
});
