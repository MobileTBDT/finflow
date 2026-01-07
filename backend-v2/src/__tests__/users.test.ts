import supertest from 'supertest';
import app from '../app';
import { prismaMock } from './setup';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const request = supertest(app);
const mockToken = jwt.sign({ sub: 1, username: 'u' }, 'your-secret-key-change-this');

describe('Users Controller', () => {
  it('GET /users/me - Thành công', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, username: 'u' } as any);
    const res = await request.get('/users/me').set('Authorization', `Bearer ${mockToken}`);
    expect(res.status).toBe(200);
  });

  it('PUT /users/me - Update profile thành công', async () => {
    prismaMock.user.update.mockResolvedValue({ id: 1 } as any);
    const res = await request.put('/users/me').set('Authorization', `Bearer ${mockToken}`)
      .send({ fullname: 'New' });
    expect(res.status).toBe(200);
  });

  it('PUT /users/me/password - Đổi pass thành công', async () => {
    const hashed = await bcrypt.hash('old', 10);
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, password: hashed } as any);
    prismaMock.user.update.mockResolvedValue({ id: 1 } as any);
    const res = await request.put('/users/me/password').set('Authorization', `Bearer ${mockToken}`)
      .send({ currentPassword: 'old', newPassword: 'new' });
    expect(res.status).toBe(200);
  });

  it('GET /users/me - Thất bại (User không tồn tại)', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await request.get('/users/me').set('Authorization', `Bearer ${mockToken}`);
    expect(res.status).toBe(404);
  });

  it('PUT /users/me/password - Thất bại (Sai mật khẩu cũ)', async () => {
    const hashed = await bcrypt.hash('real_password', 10);
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, password: hashed } as any);
    
    const res = await request.put('/users/me/password')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ currentPassword: 'wrong_password', newPassword: 'new' });
    
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Current password is incorrect");
  });
});