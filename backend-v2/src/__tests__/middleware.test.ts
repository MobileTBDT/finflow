import { authMiddleware } from '../middleware/auth.middleware';

describe('Auth Middleware', () => {
  it('Trả về 401 nếu không có Header Authorization', () => {
    const req = { headers: {} } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('Trả về 401 nếu Token sai', () => {
    const req = { headers: { authorization: 'Bearer sai' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    authMiddleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });
});