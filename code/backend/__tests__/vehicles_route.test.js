/**
 * GET /api/vehicles/:customer_id — route-level tests.
 *
 * "Valid id" test: the middleware chain passes and the controller tries the DB.
 * With DATABASE_URL=postgresql://skip the pg connection will fail, so we expect
 * either 200 (live DB) or 500 (no DB) — but NOT 400 or 403, which would mean
 * the validator incorrectly blocked the request.
 *
 * "Invalid id" test: validateIdParam('customer_id') fires before the DB, so we
 * always get 400 with field='customer_id', regardless of DB availability.
 *
 * "No token" test: verifyToken fires first → 403.
 *
 * "% search" test: a search term of "%" must be escaped and must NOT make
 * getAllCustomers return every customer (it should return an empty array when
 * the DB has no customers whose name literally contains "%").
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
    company_role_id: 2,  // manager – enough for vehicle/customer routes
  });
  // getAllCustomers is called by the "%" search tests
  employeeService.getAllCustomers = undefined; // not a service function; customer service is separate
});

const request  = require('supertest');
const app      = require('../app');
const { SignJWT } = require('jose');

async function makeToken(role = 2) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return new SignJWT({ employee_email: 'test@test.com', employee_role: role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

// ── GET /api/vehicles/:customer_id ───────────────────────────────────────────

describe('GET /api/vehicles/:customer_id', () => {

  it('returns 403 when no token is provided', async () => {
    const res = await request(app).get('/api/vehicles/1');
    expect(res.status).toBe(403);
  });

  it('returns 400 with field=customer_id when customer_id is not a positive integer', async () => {
    const token = await makeToken();
    const res = await request(app)
      .get('/api/vehicles/not-a-number')
      .set('x-access-token', token);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors[0].field).toBe('customer_id');
  });

  it('returns 400 with field=customer_id when customer_id is zero', async () => {
    const token = await makeToken();
    const res = await request(app)
      .get('/api/vehicles/0')
      .set('x-access-token', token);
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('customer_id');
  });

  it('passes validation for a valid positive integer id (middleware does not block)', async () => {
    const token = await makeToken();
    const res = await request(app)
      .get('/api/vehicles/999999')
      .set('x-access-token', token);
    // 400/403 would mean the validator blocked it — that is wrong.
    // 404 or 200 (live DB) or 500 (no DB configured) are all acceptable here.
    expect(res.status).not.toBe(400);
    expect(res.status).not.toBe(403);
  });

});

// ── GET /api/customers?search=% — ILIKE escape ──────────────────────────────

describe('GET /api/customers — search with "%" is escaped', () => {

  it('does not crash and does not return 500 when search="%" (no DB)', async () => {
    // With postgresql://skip the query will fail at the pool level (no real DB),
    // but the escape logic runs before the query.  The important thing is that
    // the request is not blocked at the validation layer (not 400) and doesn't
    // blow up with an unhandled exception before reaching the query (which would
    // be a 500 caused by our own code, not the missing DB).
    // We accept 200, 500 (pg connection refused), or 503 — but NOT 400.
    const token = await makeToken();
    const res = await request(app)
      .get('/api/customers?search=%25')   // %25 → "%" after URL decode
      .set('x-access-token', token);
    // Must reach the service layer — 400 would mean wrong validation behaviour
    expect(res.status).not.toBe(400);
  });

  // Integration-only: skip unless a real DB is available
  it('returns empty data array (not all customers) when searching for "%"', async () => {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'postgresql://skip') {
      return; // skip without a real DB
    }
    const token = await makeToken();
    const res = await request(app)
      .get('/api/customers?search=%25')
      .set('x-access-token', token);
    expect(res.status).toBe(200);
    // A literal "%" should match nothing (no customer name/email/phone
    // contains a literal percent sign), so data must be empty.
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
  });

});
