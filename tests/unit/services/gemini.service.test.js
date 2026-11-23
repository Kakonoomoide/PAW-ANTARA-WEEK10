import { describe, it, expect, vi, beforeEach } from 'vitest';
const { Product } = require('../../../models');
const { genAI, MODEL_NAME } = require('../../../config/gemini');
const {
  buildSystemInstruction,
  askGemini,
} = require('../../../services/gemini.service');

describe('gemini.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('membangun instruksi sistem dari data produk', async () => {
    vi.spyOn(Product, 'findAll').mockResolvedValue([
      { name: 'Laptop', price: 10_000, stock: 3, description: 'Ringan' },
    ]);

    const instruction = await buildSystemInstruction();

    expect(instruction).toContain('Laptop');
    expect(instruction).toContain('Rp10.000');
    expect(instruction).toContain('Ringan');
  });

  it('mengirim pesan dan mengembalikan teks balasan', async () => {
    vi.spyOn(Product, 'findAll').mockResolvedValue([]);
    const generateContent = vi.fn().mockResolvedValue({
      response: { text: () => 'Halo, ada yang bisa dibantu?' },
    });
    const getGenerativeModel = vi.spyOn(genAI, 'getGenerativeModel').mockReturnValue({
      generateContent,
    });

    const reply = await askGemini('Apa ada laptop?');

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({ model: MODEL_NAME, systemInstruction: expect.any(String) }),
    );
    expect(generateContent).toHaveBeenCalledWith('Apa ada laptop?');
    expect(reply).toBe('Halo, ada yang bisa dibantu?');
  });
});
