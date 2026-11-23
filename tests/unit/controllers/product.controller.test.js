import { describe, it, expect, vi, beforeEach } from 'vitest';
const { Product } = require('../../../models');
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require('../../../controllers/product.controller');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

describe('product.controller', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('mengambil daftar produk', async () => {
    const findAll = vi.spyOn(Product, 'findAll').mockResolvedValue([{ id: 1, name: 'Laptop' }]);
    const res = createRes();

    await getProducts({}, res);

    expect(findAll).toHaveBeenCalledWith({ order: [['createdAt', 'DESC']] });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('menolak produk tanpa nama atau harga', async () => {
    const res = createRes();
    await addProduct({ body: { description: 'Tanpa data wajib' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('menambahkan produk dengan nilai stock default', async () => {
    const product = { id: 1, name: 'Laptop', price: 10_000, stock: 0 };
    const create = vi.spyOn(Product, 'create').mockResolvedValue(product);
    const res = createRes();

    await addProduct(
      { body: { name: 'Laptop', description: '', price: 10_000 } },
      res,
    );

    expect(create).toHaveBeenCalledWith({
      name: 'Laptop',
      description: '',
      price: 10_000,
      stock: 0,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('mengembalikan 404 saat update produk tidak ditemukan', async () => {
    vi.spyOn(Product, 'findByPk').mockResolvedValue(null);
    const res = createRes();

    await updateProduct({ params: { id: '99' }, body: { name: 'Baru' } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('menghapus produk yang ditemukan', async () => {
    const destroy = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(Product, 'findByPk').mockResolvedValue({ id: 1, destroy });
    const res = createRes();

    await deleteProduct({ params: { id: '1' } }, res);

    expect(destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
