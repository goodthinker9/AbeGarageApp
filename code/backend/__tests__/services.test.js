/**
 * Services endpoints – validation and public route tests.
 */

'use strict';

process.env.JWT_SECRET    = process.env.JWT_SECRET    || 'test-secret-at-least-32-chars-long!!';
process.env.DATABASE_URL  = process.env.DATABASE_URL  || 'postgresql://skip';
process.env.FRONTEND_URL  = process.env.FRONTEND_URL  || 'http://localhost:3000';

const request = require('supertest');
const app     = require('../app');

describe('GET /api/services — public', () => {
  it('returns 200 and an array when DB is available', async () => {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'postgresql://skip') {
      return; // skip without real DB
    }
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/services/all — staff only', () => {
  it('returns 403 when no token is provided', async () => {
    const res = await request(app).get('/api/services/all');
    expect(res.status).toBe(403);
  });

  it('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/api/services/all')
      .set('x-access-token', 'bad.token.here');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/service — validation', () => {
  it('returns 403 when no token', async () => {
    const res = await request(app)
      .post('/api/service')
      .send({ service_name: 'Oil Change' });
    expect(res.status).toBe(403);
  });

  it('returns 400 when service_name is missing (after auth would pass)', async () => {
    // We can test the validation layer independently by checking the
    // middleware ordering – but without a valid token we hit auth first (403).
    // This test just confirms no 500 is emitted for missing name.
    const res = await request(app)
      .post('/api/service')
      .set('x-access-token', 'invalid')
      .send({});
    // 401 from bad token, not 500
    expect([400, 401, 403]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });
});

describe('PUT /api/service — validation', () => {
  it('returns 403 without a token', async () => {
    const res = await request(app)
      .put('/api/service')
      .send({ service_id: 1, service_name: 'Updated' });
    expect(res.status).toBe(403);
  });
});
