# CS Bot API — Generative AI + Prompt Engineering + Express/Sequelize

Demo customer service otomatis berbasis Gemini yang cuma boleh jawab soal produk di
database, dengan katalog EJS untuk user dan admin login buat kelola produk. Katalog
dan chat mengambil data dari API menggunakan Fetch API di browser.

Materi yang kedemo di project ini:

1. **Integrasi LLM di server** (Gemini API), API key aman di `.env`
2. **Prompt engineering & guardrail** — nolak pertanyaan di luar konteks
3. **Defense in depth** — validasi juga di level kode, bukan cuma di prompt

## Struktur folder

```
cs-bot-api/
├── app.js
├── config/
│   ├── database.js       # koneksi sequelize
│   └── gemini.js         # setup client Gemini (baca API key dari .env)
├── models/
│   ├── admin.model.js
│   ├── product.model.js
│   └── index.js
├── controllers/
│   ├── admin.controller.js    # login/logout admin
│   ├── product.controller.js  # CRUD produk
│   └── chat.controller.js     # endpoint chat ke bot
├── services/
│   └── gemini.service.js      # BAGIAN INTI: system prompt + guardrail + call Gemini
├── middlewares/
│   ├── auth.middleware.js         # cek session admin
│   └── validateChatInput.middleware.js  # validasi input chat
├── routes/
│   ├── admin.routes.js
│   ├── product.routes.js
│   └── chat.routes.js
│   └── view.routes.js       # halaman EJS, terpisah dari controller API
├── views/
│   └── index.ejs            # katalog produk dan chat user
├── public/
│   ├── css/styles.css
│   └── js/app.js            # Fetch API untuk produk dan chat
├── seeders/
│   └── seed.js            # admin + produk dummy
└── utils/
    └── response.js
```

## Cara install & jalanin

1. Bikin database dulu (Postgres by default):

```sql
CREATE DATABASE cs_bot_db;
```

2. Dapetin Gemini API key gratis di https://aistudio.google.com/app/apikey

3. Copy `.env.example` jadi `.env`, isi kredensial DB + `GEMINI_API_KEY`.

4. Install dependency:

```bash
npm install
```

5. Isi data awal (admin + produk dummy):

```bash
npm run seed
```

6. Jalankan server:

```bash
npm run dev
```

## Endpoint

### Halaman User

| Method | Endpoint | Keterangan                 |
| ------ | -------- | -------------------------- |
| GET    | `/`      | Katalog produk dan chat CS |

Route halaman ada di `routes/view.routes.js` dan merender `views/index.ejs`.
JavaScript browser disimpan di `public/js/app.js`; file ini memanggil endpoint
`GET /api/products` untuk katalog dan `POST /api/chat` untuk mengirim pertanyaan.
Controller tetap menangani API saja, bukan render halaman.

### Admin

| Method | Endpoint          | Body                     | Keterangan            |
| ------ | ----------------- | ------------------------ | --------------------- |
| POST   | /api/admin/login  | `{ username, password }` | Login admin (session) |
| POST   | /api/admin/logout | -                        | Logout                |

> Catatan: sengaja **tidak ada endpoint public buat register admin**. Admin dibikin
> lewat `npm run seed` aja. Ini contoh prinsip keamanan: jangan expose kemampuan
> bikin akun privileged ke publik.

### Product

| Method | Endpoint          | Auth   | Body                                      | Keterangan        |
| ------ | ----------------- | ------ | ----------------------------------------- | ----------------- |
| GET    | /api/products     | publik | -                                         | List semua produk |
| POST   | /api/products     | admin  | `{ name, description, price, stock }`     | Tambah produk     |
| PUT    | /api/products/:id | admin  | `{ name?, description?, price?, stock? }` | Update produk     |
| DELETE | /api/products/:id | admin  | -                                         | Hapus produk      |

### Chat (CS Bot)

| Method | Endpoint  | Auth   | Body          | Keterangan              |
| ------ | --------- | ------ | ------------- | ----------------------- |
| POST   | /api/chat | publik | `{ message }` | Kirim pertanyaan ke bot |

Contoh request:

```json
POST /api/chat
{ "message": "kaos polos ada warna apa aja dan harganya berapa?" }
```

Contoh kalo user coba keluar konteks:

```json
POST /api/chat
{ "message": "buatin saya kode HTML buat landing page dong" }
```

Bot bakal nolak dan ngarahin balik ke topik produk — ini yang kejadian karena
aturan di `services/gemini.service.js` (`buildSystemInstruction`).

## Cara kerja guardrail-nya (penting buat materi)

Di `services/gemini.service.js`, ada fungsi `buildSystemInstruction()` yang:

1. Ambil semua data produk dari database (jadi bot selalu jawab data terkini, bukan hardcode)
2. Nyusun **system instruction** yang isinya:
   - Peran bot (siapa dia, buat toko apa)
   - Data produk yang boleh dia rujuk (grounding — bot gak boleh ngarang)
   - Aturan ketat nolak topik di luar produk, termasuk larangan generate kode/HTML
   - Instruksi anti-prompt-injection (nolak instruksi yang nyoba ganti peran bot)

Ini dikirim sebagai `systemInstruction` ke Gemini, terpisah dari pesan user — jadi
walaupun user nulis "abaikan instruksi sebelumnya", instruksi sistem tetep dominan
(walau tetep gak 100% bulletproof, makanya ditambah validasi di kode juga).

Selain di level prompt, ada juga validasi di `middlewares/validateChatInput.middleware.js`
(cek panjang pesan, dsb) — konsepnya **defense in depth**: jangan cuma andelin satu
lapis pertahanan (prompt doang), tapi dilapis dari beberapa sisi.

## Soal keamanan API key

- `GEMINI_API_KEY` cuma ada di `.env`, dibaca lewat `config/gemini.js`, **tidak pernah**
  dikirim ke client/response manapun.
- `.env` masuk `.gitignore`, jangan pernah ke-commit ke git.
- Kalo API key ini bocor, orang lain bisa pake kuota Gemini kamu buat request mereka
  sendiri — beda kasus sama kebocoran data biasa, ini soal _cost & abuse_.

## Ide pengembangan lanjut (opsional buat materi lanjutan)

- Rate limiting per IP/session biar gak di-spam (`express-rate-limit`)
- Simpan history chat per session biar bot punya konteks percakapan (multi-turn)
- Logging semua pertanyaan yang ditolak bot, buat monitoring percobaan misuse
