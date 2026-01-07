import supertest from 'supertest';
import app from '../app';
import { prismaMock } from './setup';
import bcrypt from 'bcryptjs';

const request = supertest(app);

describe('Auth Controller', () => {
  it('POST /auth/register - Thành công', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: 1, username: 'u', email: 'e@g.com' } as any);
    prismaMock.category.createMany.mockResolvedValue({ count: 15 } as any);
    prismaMock.user.update.mockResolvedValue({ id: 1 } as any);

    const res = await request.post('/auth/register').send({
      username: 'u', email: 'e@g.com', password: 'p', fullname: 'f', phone: '01', dateofbirth: '1990-01-01'
    });
    expect(res.status).toBe(201);
  });

  it('POST /auth/login - Thành công', async () => {
    const hashed = await bcrypt.hash('p', 10);
    prismaMock.user.findFirst.mockResolvedValue({ id: 1, username: 'u', password: hashed } as any);
    prismaMock.user.update.mockResolvedValue({ id: 1 } as any);

    const res = await request.post('/auth/login').send({ username: 'u', password: 'p' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
  });

  it('POST /auth/login - Thất bại (Sai pass hoặc không thấy user)', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const res = await request.post('/auth/login').send({ username: 'u', password: 'p' });
    expect(res.status).toBe(401);

    const hashed = await bcrypt.hash('p', 10);
    prismaMock.user.findFirst.mockResolvedValue({ id: 1, password: hashed } as any);
    const res2 = await request.post('/auth/login').send({ username: 'u', password: 'wrong' });
    expect(res2.status).toBe(401);
  });

  it('POST /auth/register - Thất bại (Thiếu trường)', async () => {
    const res = await request.post('/auth/register').send({ username: 'u' }); // Thiếu email, pass...
    expect(res.status).toBe(400);
  });

  it('POST /auth/register - Thất bại (User đã tồn tại)', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 1 } as any); // Giả lập tìm thấy user trùng
    const res = await request.post('/auth/register').send({
      username: 'u', email: 'e@g.com', password: 'p', fullname: 'f'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it('POST /auth/login - Thất bại (Thiếu username/password)', async () => {
    const res = await request.post('/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('POST /auth/login - Trả về 500 nếu Database bị sập', async () => {
    // Ép hàm findFirst của user bắn ra lỗi
    prismaMock.user.findFirst.mockRejectedValue(new Error('Connection failed'));
    
    const res = await request.post('/auth/login').send({ username: 'u', password: 'p' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
    });
});