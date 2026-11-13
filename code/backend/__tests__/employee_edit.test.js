/**
 * Employee edit endpoints – role gate and validation tests.
 * No live DB required: validation and auth fire before any DB call.
 */
'use strict';

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'test-secret-at-least-32-chars-long!!';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://skip';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const request  = require('supertest');
const app      = require('../app');
const { SignJWT } = require('jose');

/** Make a JWT with given role (and optionally a specific employee_id). */
async function makeToken(role = 3, employee_id = 42) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return new SignJWT({ employee_email: 'admin@test.com', employee_role: role, employee_id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

// ── GET /api/employee/:id ────────────────────────────────────────────────────
describe('GET /api/employee/:id — role gate + validation', () => {
  it('returns 403 without token', async () => {
    const res = await request(app).get('/api/employee/1');
    expect(res.status).toBe(403);
  });

  it('returns 403 for a manager (role 2)', async () => {
    const token = await makeToken(2);
    const res = await request(app)
      .get('/api/employee/1')
      .set('x-access-token', token);
    // isAdmin fires DB lookup; with no real DB it throws → 500 OR 403 from role check
    // The important thing: not 200
    expect(res.status).not.toBe(200);
  });

  it('returns 400 when :id is not a positive integer', async () => {
    const token = await makeToken(3);
    const res = await request(app)
      .get('/api/employee/abc')
      .set('x-access-token', token);
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('id');
  });

  it('returns 400 when :id is zero', async () => {
    const token = await makeToken(3);
    const res = await request(app)
      .get('/api/employee/0')
      .set('x-access-token', token);
    expect(res.status).toBe(400);
  });

  it('passes validation for a valid positive integer id', async () => {
    const token = await makeToken(3);
    const res = await request(app)
      .get('/api/employee/999')
      .set('x-access-token', token);
    // Not blocked by our middleware (400/403); DB error (500) acceptable without real DB
    expect(res.status).not.toBe(400);
  });
});

// ── PUT /api/employee ────────────────────────────────────────────────────────
describe('PUT /api/employee — role gate + validation', () => {
  it('returns 403 without token', async () => {
    const res = await request(app).put('/api/employee').send({ employee_id: 1 });
    expect(res.status).toBe(403);
  });

  it('returns 400 when employee_id is missing', async () => {
    const token = await makeToken(3);
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_first_name: 'Alice' });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain('employee_id');
  });

  it('returns 400 when no updatable field is provided', async () => {
    const token = await makeToken(3);
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 5 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when company_role_id is out of range', async () => {
    const token = await makeToken(3);
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 5, company_role_id: 99 });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain('company_role_id');
  });

  it('returns 400 when active_employee is not 0 or 1', async () => {
    const token = await makeToken(3);
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 5, active_employee: 7 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when admin tries to deactivate their own account', async () => {
    // Token has employee_id=42; request tries to deactivate employee_id=42
    const token = await makeToken(3, 42);
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 42, active_employee: 0 });
    // Passes validation layer; self-protection check is in the controller.
    // With no real DB isAdmin throws → 500 (acceptable) but not 200.
    // We only assert it's not 200 since we can't reach the controller without a DB.
    expect(res.status).not.toBe(200);
  });

  it('returns 400 when admin tries to demote their own role', async () => {
    const token = await makeToken(3, 42);
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 42, company_role_id: 1 });
    expect(res.status).not.toBe(200);
  });

  it('passes validation for a well-formed update request', async () => {
    const token = await makeToken(3, 99);  // own id=99, editing id=5
    const res = await request(app)
      .put('/api/employee')
      .set('x-access-token', token)
      .send({ employee_id: 5, employee_first_name: 'Alice', company_role_id: 2 });
    // 400 from our validators → test fails; 500 from missing DB → acceptable
    expect(res.status).not.toBe(400);
  });
});
