import supertest from 'supertest';
import app from '../app';
import { prismaMock } from './setup';
import jwt from 'jsonwebtoken';

const request = supertest(app);
const mockToken = jwt.sign({ sub: 1, username: 'test' }, 'your-secret-key-change-this');

describe('Transaction System', () => {
  it('Nên lấy danh sách transactions thành công', async () => {
    prismaMock.transaction.findMany.mockResolvedValue([{ id: 1, amount: 10 } as any]);
    const res = await request.get('/transactions').set('Authorization', `Bearer ${mockToken}`);
    expect(res.status).toBe(200);
  });

  it('Nên báo lỗi 400 nếu thiếu trường khi tạo transaction', async () => {
    const res = await request.post('/transactions').set('Authorization', `Bearer ${mockToken}`).send({ amount: 10 });
    expect(res.status).toBe(400);
  });

  it('Nên xử lý lỗi 500 trong createTransaction', async () => {
    prismaMock.transaction.create.mockRejectedValue(new Error('Err'));
    const res = await request.post('/transactions').set('Authorization', `Bearer ${mockToken}`).send({ amount: 10, date: '2025', categoryId: 1 });
    expect(res.status).toBe(500);
  });

  it('getTransactions: Lỗi 500', async () => {
    prismaMock.transaction.findMany.mockRejectedValue(new Error('Trans Error'));
    const res = await request.get('/transactions').set('Authorization', `Bearer ${mockToken}`);
    expect(res.status).toBe(500);
    });
});