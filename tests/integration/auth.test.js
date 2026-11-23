import { describe, it, expect, vi, beforeEach } from 'vitest';
const request = require('supertest');
const bcrypt = require('bcrypt');
const { Admin } = require('../../models');
const { validAdmin, loginPayload } = require('../fixtures/users');
const app = require('../../app');

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('login berhasil dengan credential yang benar', async () => {
    vi.spyOn(Admin, 'findOne').mockResolvedValue(validAdmin);
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const response = await request(app).post('/api/admin/login').send(loginPayload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.username).toBe('admin');
  });

  it('login gagal jika password salah', async () => {
    vi.spyOn(Admin, 'findOne').mockResolvedValue(validAdmin);
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const response = await request(app).post('/api/admin/login').send({
      username: 'admin',
      password: 'salah',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('login gagal jika field wajib kosong', async () => {
    const response = await request(app).post('/api/admin/login').send({});

    expect(response.status).toBe(400);
  });
});
