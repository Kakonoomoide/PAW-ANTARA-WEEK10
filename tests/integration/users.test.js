import { describe, it, expect, vi, beforeEach } from 'vitest';
const request = require('supertest');
const bcrypt = require('bcrypt');
const { Admin, Product } = require('../../models');
const { validAdmin, loginPayload } = require('../fixtures/users');
const app = require('../../app');

describe('admin session lifecycle', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('menjaga session admin untuk endpoint protected', async () => {
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

    const response = await agent
      .post('/api/products')
      .send({ name: 'Laptop', price: 10_000, stock: 2 });

    expect(response.status).toBe(201);
  });

  it('logout mengakhiri session admin', async () => {
    const agent = request.agent(app);
    vi.spyOn(Admin, 'findOne').mockResolvedValue(validAdmin);
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    await agent.post('/api/admin/login').send(loginPayload).expect(200);
    await agent.post('/api/admin/logout').expect(200);

    const protectedResponse = await agent.post('/api/products').send({
      name: 'Laptop',
      price: 10_000,
    });

    expect(protectedResponse.status).toBe(401);
  });
});
