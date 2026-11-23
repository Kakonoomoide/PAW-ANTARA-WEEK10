import { describe, it, expect, vi } from 'vitest';
const validateChatInput = require('../../../middlewares/validateChatInput.middleware');

describe('validateChatInput.middleware', () => {
  it('menolak message kosong', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validateChatInput({ body: { message: '   ' } }, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('menolak message lebih dari 500 karakter', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validateChatInput({ body: { message: 'a'.repeat(501) } }, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('memanggil next untuk message valid', () => {
    const res = { status: vi.fn(), json: vi.fn() };
    const next = vi.fn();

    validateChatInput({ body: { message: 'Ada laptop?' } }, res, next);

    expect(next).toHaveBeenCalled();
  });
});
