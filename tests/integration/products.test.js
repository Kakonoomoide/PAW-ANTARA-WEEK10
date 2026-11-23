import { describe, it, expect, vi, beforeEach } from 'vitest';
const request = require('supertest');
const bcrypt = require('bcrypt');
const { Admin, Product } = require('../../models');
const { validAdmin, loginPayload } = require('../fixtures/users');
const app = require('../../app');

describe('produk API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/products dapat diakses publik', async () => {
    vi.spyOn(Product, 'findAll').mockResolvedValue([
      { id: 1, name: 'Laptop', price: 10_000, stock: 2 },
    ]);

    const response = await request(app).get('/api/products');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('POST /api/products menolak request tanpa login', async () => {
    const response = await request(app).post('/api/products').send({
      name: 'Laptop',
      price: 10_000,
    });

    expect(response.status).toBe(401);
  });

  it('POST /api/products berhasil untuk admin yang login', async () => {
    const agent = request.agent(app);
    vi.spyOn(Admin, 'findOne').mockResolvedValue(validAdmin);
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    vi.spyOn(Product, 'create').mockResolvedValue({
      id: 1,
      name: 'Laptop',
      price: 10_000,
      stock: 2,
    });

    await agent.post('/api/admin/login').send(loginPayload).expect(200);

    const response = await agent.post('/api/products').send({
      name: 'Laptop',
      price: 10_000,
      stock: 2,
    });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Laptop');
  });
});
