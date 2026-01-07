import supertest from 'supertest';
import app from '../app';
import { prismaMock } from './setup';
import jwt from 'jsonwebtoken';

const request = supertest(app);
const mockToken = jwt.sign({ sub: 1, username: 't' }, 'your-secret-key-change-this');

describe('Budgets Controller', () => {
  it('GET /budgets - Thành công', async () => {
    prismaMock.budget.findMany.mockResolvedValue([]);
    const res = await request.get('/budgets').set('Authorization', `Bearer ${mockToken}`);
    expect(res.status).toBe(200);
  });

  it('POST /budgets - Create/Update thành công', async () => {
    prismaMock.budget.upsert.mockResolvedValue({ id: 1, amount: 100 } as any);
    const res = await request.post('/budgets').set('Authorization', `Bearer ${mockToken}`)
      .send({ categoryId: 1, amount: 100 });
    expect(res.status).toBe(200);
  });

  it('DELETE /budgets/:id - Thành công', async () => {
    prismaMock.budget.findFirst.mockResolvedValue({ id: 1, userId: 1 } as any);
    prismaMock.budget.delete.mockResolvedValue({ id: 1 } as any);
    const res = await request.delete('/budgets/1').set('Authorization', `Bearer ${mockToken}`);
    expect(res.status).toBe(200);
  });

  it('Catch Error 500 - Budget', async () => {
    prismaMock.budget.findMany.mockRejectedValue(new Error('err'));
    const res = await request.get('/budgets').set('Authorization', `Bearer ${mockToken}`);
    expect(res.status).toBe(500);
  });

  it('POST /budgets - Thất bại (Thiếu categoryId hoặc amount)', async () => {
    const res = await request.post('/budgets').set('Authorization', `Bearer ${mockToken}`).send({});
    expect(res.status).toBe(400);
  });

  it('DELETE /budgets/:id - Thất bại (Không tìm thấy budget)', async () => {
    prismaMock.budget.findFirst.mockResolvedValue(null);
    const res = await request.delete('/budgets/999').set('Authorization', `Bearer ${mockToken}`);
    expect(res.status).toBe(404);
  });
});