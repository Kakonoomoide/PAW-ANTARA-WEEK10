import { describe, it, expect, vi, beforeEach } from 'vitest';
const bcrypt = require('bcrypt');
const { Admin } = require('../../../models');
const { login, logout } = require('../../../controllers/admin.controller');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    clearCookie: vi.fn(),
  };
}

describe('admin.controller', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('login gagal jika data wajib tidak ada', async () => {
    const res = createRes();
    await login({ body: {}, session: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('login berhasil dan menyimpan adminId ke session', async () => {
    const req = {
      body: { username: 'admin', password: 'password123' },
      session: {},
    };
    const res = createRes();
    vi.spyOn(Admin, 'findOne').mockResolvedValue({
      id: 1,
      username: 'admin',
      password: 'hashed',
    });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    await login(req, res);

    expect(req.session.adminId).toBe(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('logout menghancurkan session dan menghapus cookie', () => {
    const res = createRes();
    const req = {
      session: {
        destroy: vi.fn((callback) => callback(null)),
      },
    };

    logout(req, res);

    expect(req.session.destroy).toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalledWith('connect.sid');
  });
});
