import supertest from 'supertest';
import app from '../app';
import { prismaMock } from './setup';
import jwt from 'jsonwebtoken';

const request = supertest(app);
const mockToken = jwt.sign({ sub: 1, username: 'test' }, 'your-secret-key-change-this');

describe('Categories System', () => {
  it('Nên lấy danh sách categories thành công', async () => {
    prismaMock.category.findMany.mockResolvedValue([
      { id: 1, name: 'Food', userId: 1 }
    ] as any);

    const res = await request
      .get('/categories')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  it('getCategories: Lỗi 500', async () => {
    prismaMock.category.findMany.mockRejectedValue(new Error('Cat Error'));
    const res = await request.get('/categories').set('Authorization', `Bearer ${mockToken}`);
    expect(res.status).toBe(500);
    });
});