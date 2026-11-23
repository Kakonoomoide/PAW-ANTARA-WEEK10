import { describe, it, expect, vi } from 'vitest';
const sendResponse = require('../../../utils/response');

describe('sendResponse', () => {
  it('mengembalikan status dan payload JSON default', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    sendResponse(res, { message: 'OK', data: { id: 1 } });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      code: 200,
      success: true,
      message: 'OK',
      data: { id: 1 },
    });
  });

  it('menggunakan custom status dan success', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    sendResponse(res, { code: 400, success: false, message: 'Gagal' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      code: 400,
      success: false,
      message: 'Gagal',
      data: null,
    });
  });
});
