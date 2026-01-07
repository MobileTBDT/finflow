// src/__tests__/app.test.ts
import supertest from 'supertest';
import app from '../app';

const request = supertest(app);

describe('App Core', () => {
  test('GET / should return 200', async () => {
    const res = await request.get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('FinFlow API v2');
  });

  test('404 for unknown routes', async () => {
    const res = await request.get('/unknown-route');
    expect(res.status).toBe(404);
  });
});