/**
 * Login endpoint – validation and authentication tests.
 * Uses supertest so the actual DB is NOT hit for validation cases.
 * The integration test (valid credentials) hits Supabase; it is skipped
 * when DATABASE_URL is not set (CI without secrets).
 */

'use strict';

process.env.JWT_SECRET    = process.env.JWT_SECRET    || 'test-secret-at-least-32-chars-long!!';
process.env.DATABASE_URL  = process.env.DATABASE_URL  || 'postgresql://skip';
process.env.FRONTEND_URL  = process.env.FRONTEND_URL  || 'http://localhost:3000';

const request = require('supertest');
const app     = require('../app');

describe('POST /api/employee/login — validation', () => {
  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/employee/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/employee/login')
      .send({ employee_password: 'password123' });
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('employee_email');
  });

  it('returns 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/employee/login')
      .send({ employee_email: 'notanemail', employee_password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('employee_email');
  });

  it('returns 400 when password is too short (< 8 chars)', async () => {
    const res = await request(app)
      .post('/api/employee/login')
      .send({ employee_email: 'test@test.com', employee_password: 'short' });
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain('employee_password');
  });

  it('returns 403 for valid format but wrong credentials', async () => {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'postgresql://skip') {
      return; // skip when no real DB
    }
    const res = await request(app)
      .post('/api/employee/login')
      .send({ employee_email: 'nobody@nowhere.com', employee_password: 'password123' });
    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
  });
});
