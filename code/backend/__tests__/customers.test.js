/**
 * Customer endpoints – auth gate, validation, and 404-on-bad-id tests.
 * Does NOT require a live database: validation and auth checks fire before
 * any DB call is made.
 */
'use strict';

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'test-secret-at-least-32-chars-long!!';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://skip';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const request = require('supertest');
const app     = require('../app');

// ── GET /api/customers ───────────────────────────────────────────────────────
describe('GET /api/customers — auth gate', () => {
  it('returns 403 when no token', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(403);
  });
  it('returns 401 when token is invalid', async () => {
    const res = await request(app).get('/api/customers').set('x-access-token', 'bad.token');
    expect(res.status).toBe(401);
  });
});

// ── GET /api/customer/:id ────────────────────────────────────────────────────
describe('GET /api/customer/:id — validation', () => {
  it('returns 403 without token', async () => {
    const res = await request(app).get('/api/customer/1');
    expect(res.status).toBe(403);
  });
  it('returns 400 when id is not a positive integer', async () => {
    // We need a structurally valid token; we don't need a real DB because
    // validateIdParam fires before any DB lookup.  Use a token signed with
    // the same test secret that app.js uses.
    const { SignJWT } = require('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ employee_email: 'x@x.com', employee_role: 2 })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    const res = await request(app)
      .get('/api/customer/abc')
      .set('x-access-token', token);
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('id');
  });
  it('returns 400 when id is zero', async () => {
    const { SignJWT } = require('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ employee_email: 'x@x.com', employee_role: 2 })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    const res = await request(app)
      .get('/api/customer/0')
      .set('x-access-token', token);
    expect(res.status).toBe(400);
  });
});

// ── POST /api/customer ───────────────────────────────────────────────────────
describe('POST /api/customer — validation', () => {
  it('returns 403 without token', async () => {
    const res = await request(app).post('/api/customer').send({});
    expect(res.status).toBe(403);
  });
  it('returns 400 when required fields are missing', async () => {
    const { SignJWT } = require('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ employee_email: 'x@x.com', employee_role: 2 })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    const res = await request(app)
      .post('/api/customer')
      .set('x-access-token', token)
      .send({ customer_first_name: 'Jane' }); // missing email, phone, last name
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('customer_email');
    expect(fields).toContain('customer_phone_number');
    expect(fields).toContain('customer_last_name');
  });
  it('returns 400 for invalid email format', async () => {
    const { SignJWT } = require('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ employee_email: 'x@x.com', employee_role: 2 })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    const res = await request(app)
      .post('/api/customer')
      .set('x-access-token', token)
      .send({ customer_email: 'notvalid', customer_phone_number: '555', customer_first_name: 'A', customer_last_name: 'B' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('customer_email');
  });
});

// ── PUT /api/customer ────────────────────────────────────────────────────────
describe('PUT /api/customer — validation', () => {
  it('returns 400 when customer_id is missing', async () => {
    const { SignJWT } = require('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ employee_email: 'x@x.com', employee_role: 2 })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    const res = await request(app)
      .put('/api/customer')
      .set('x-access-token', token)
      .send({ customer_first_name: 'Jane' });
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('customer_id');
  });
});

// ── Unknown /api route ───────────────────────────────────────────────────────
describe('Unknown /api route', () => {
  it('returns 404 JSON for unknown path', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });
});
