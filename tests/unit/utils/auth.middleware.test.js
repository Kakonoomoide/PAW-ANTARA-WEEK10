import { describe, it, expect, vi } from 'vitest';
const requireAdminAuth = require('../../../middlewares/auth.middleware');

describe('auth.middleware', () => {
  it('menolak request tanpa session admin', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireAdminAuth({ session: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('memanggil next untuk admin yang login', () => {
    const res = { status: vi.fn(), json: vi.fn() };
    const next = vi.fn();

    requireAdminAuth({ session: { adminId: 1 } }, res, next);

    expect(next).toHaveBeenCalled();
  });
});
