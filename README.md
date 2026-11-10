# API Todos List Management

REST API untuk mengelola daftar tugas (todo) yang dibangun dengan **Node.js**, **Express**, dan **MongoDB**. API ini dilengkapi autentikasi JWT, otorisasi berbasis role (admin dan user), pencatatan aktivitas (activity log), statistik yang dilindungi API Key, validasi input, pengujian otomatis, dan dokumentasi interaktif dengan Swagger.

Proyek ini dikerjakan sebagai bagian dari program **Web Backend** di Gamelab Indonesia.

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Folder](#struktur-folder)
- [Instalasi](#instalasi)
- [Environment Variable](#environment-variable)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Dokumentasi API](#dokumentasi-api)
- [Ringkasan Endpoint](#ringkasan-endpoint)
- [Parameter Daftar Todo](#parameter-daftar-todo)
- [Contoh Penggunaan](#contoh-penggunaan)
- [Format Response dan Kode Status](#format-response-dan-kode-status)
- [Keamanan](#keamanan)
- [Pengujian](#pengujian)
- [Membuat Akun Admin](#membuat-akun-admin)
- [Pembuat](#pembuat)

## Fitur

- **Autentikasi JWT**: registrasi dan login, kata sandi disimpan dalam bentuk hash (bcrypt).
- **Otorisasi role**: akun `user` dan `admin`. Registrasi selalu menghasilkan role `user`.
- **Manajemen todo**: buat, lihat, ubah, dan hapus todo milik sendiri. Setiap todo terhubung ke pengguna dan kategori.
- **Manajemen kategori**: buat, lihat, ubah, dan hapus (soft delete) kategori milik sendiri.
- **Daftar todo yang lengkap**: pagination, filter (status selesai dan kategori), sorting, dan pencarian.
- **Activity log**: setiap pembuatan, perubahan, dan penghapusan todo tercatat. Pengguna biasa hanya melihat log miliknya, admin melihat semuanya.
- **Statistik**: endpoint ringkasan untuk akses mesin ke mesin yang dilindungi API Key.
- **Validasi input** dengan express-validator pada seluruh endpoint, termasuk parameter query.
- **Penanganan error terpusat** dengan kode status HTTP dan pesan yang informatif.
- **Pengujian otomatis** dengan Jest dan Supertest (unit dan integration test).
- **Dokumentasi interaktif** dengan Swagger UI.

## Teknologi

| Kebutuhan | Teknologi |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB (MongoDB Atlas) dengan Mongoose 9 |
| Autentikasi | jsonwebtoken, bcryptjs |
| Validasi | express-validator |
| Dokumentasi | swagger-ui-express (OpenAPI 3) |
| Pengujian | Jest, Supertest |
| Pengembangan | nodemon, dotenv |

## Struktur Folder

```
.
├── server.js                      # Titik masuk: koneksi database dan menjalankan server
├── jest.config.js                 # Konfigurasi Jest
├── .env.example                   # Contoh environment variable
├── postman/                       # Collection dan environment Postman
├── src/
│   ├── app.js                     # Konfigurasi Express, middleware, dan routing
│   ├── config/db.js               # Koneksi MongoDB
│   ├── controller/                # Penanganan request dan response
│   ├── services/                  # Logika bisnis (todo, activity log)
│   ├── routes/                    # Definisi endpoint
│   ├── model/                     # Skema Mongoose (User, Category, Todo, ActivityLog)
│   ├── validator/                 # Aturan validasi express-validator
│   ├── middlewares/               # auth, restrictTo, apiKey, validate, logger, notFound, errorHandler
│   ├── utils/                     # AppError dan catchAsync
│   └── docs/openapi.js            # Spesifikasi OpenAPI untuk Swagger
└── tests/
    ├── helpers/                   # Pembantu koneksi database test dan pembuatan data uji
    ├── unit/                      # Unit test middleware dan utilitas
    └── *.test.js                  # Integration test (auth, todo, stats, aplikasi)
```

## Instalasi

### Prasyarat

- [Node.js](https://nodejs.org/) versi 20 atau lebih baru (disarankan versi LTS terbaru)
- Akun [MongoDB Atlas](https://www.mongodb.com/atlas) (atau instalasi MongoDB lokal)
- Git

### Langkah

```bash
# 1. Kloning repository
git clone https://github.com/fanzv23/Gamelab-Todo-Api.git
cd Gamelab-Todo-Api

# 2. Pasang dependensi
npm install

# 3. Salin contoh environment variable, lalu isi nilainya
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

Pada MongoDB Atlas, pastikan alamat IP komputer Anda sudah ditambahkan di menu **Network Access**, jika tidak koneksi database akan ditolak.

## Environment Variable

Buat file `.env` di folder utama proyek (file ini tidak boleh di-commit).

| Variabel | Wajib | Keterangan | Contoh |
|---|---|---|---|
| `PORT` | Tidak | Port server (bawaan `3000`) | `3000` |
| `MONGODB_URI` | Ya | String koneksi MongoDB | `mongodb+srv://<user>:<password>@<cluster>/<nama-db>` |
| `JWT_SECRET` | Ya | Kunci rahasia untuk menandatangani token JWT | string acak yang panjang |
| `JWT_EXPIRES_IN` | Tidak | Masa berlaku token (bawaan `1d`) | `1d` |
| `API_KEY` | Ya untuk `/api/stats` | Kunci akses endpoint statistik | string acak |

Cara membuat nilai acak untuk `JWT_SECRET` dan `API_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

## Menjalankan Aplikasi

```bash
npm run dev      # mode pengembangan (nodemon, restart otomatis)
npm start        # mode produksi
npm test         # menjalankan seluruh pengujian
```

Server berjalan di `http://localhost:3000`. Jika berhasil, terminal menampilkan `MongoDB connected successfully`.

## Dokumentasi API

Dokumentasi interaktif tersedia di Swagger UI setelah server berjalan:

**http://localhost:3000/api-docs**

Di halaman itu semua endpoint dapat dicoba langsung dari browser. Untuk endpoint yang dilindungi, login dulu lewat `POST /api/auth/login`, salin token-nya, klik tombol **Authorize**, lalu tempel token tersebut.

Collection Postman beserta pengecekan otomatisnya (57 request, 111 test) tersedia di folder [`postman/`](postman/). Impor kedua file di dalamnya, pilih environment **Todo API - Test Run**, isi variabel `apiKey`, lalu jalankan collection dengan fitur Runner.

## Ringkasan Endpoint

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/` | Publik | Cek server hidup |
| `GET` | `/api-docs` | Publik | Dokumentasi Swagger |
| `POST` | `/api/auth/register` | Publik | Daftar akun baru (role selalu `user`) |
| `POST` | `/api/auth/login` | Publik | Login dan dapatkan token JWT |
| `GET` | `/api/todos` | Login | Daftar todo milik sendiri (pagination, filter, sorting, search) |
| `POST` | `/api/todos` | Login | Buat todo baru |
| `PATCH` | `/api/todos/:id` | Login | Ubah todo milik sendiri |
| `DELETE` | `/api/todos/:id` | Login | Hapus todo milik sendiri |
| `GET` | `/api/categories` | Login | Daftar kategori milik sendiri |
| `POST` | `/api/categories` | Login | Buat kategori baru |
| `PUT` | `/api/categories/:id` | Login | Ubah kategori milik sendiri |
| `DELETE` | `/api/categories/:id` | Login | Hapus kategori (soft delete) |
| `GET` | `/api/users` | Admin | Daftar semua pengguna |
| `GET` | `/api/logs` | Login | Activity log (user: milik sendiri, admin: semua) |
| `GET` | `/api/stats` | API Key | Ringkasan statistik (header `x-api-key`) |

Token JWT dikirim lewat header `Authorization: Bearer <token>`.

## Parameter Daftar Todo

`GET /api/todos` menerima parameter query berikut, dan semuanya boleh digabung:

| Parameter | Keterangan | Contoh |
|---|---|---|
| `page` | Nomor halaman, bilangan bulat minimal 1 (bawaan `1`) | `page=2` |
| `limit` | Jumlah data per halaman, 1 sampai 50 (bawaan `10`) | `limit=5` |
| `completed` | Filter status selesai: `true` atau `false` | `completed=true` |
| `category` | Filter berdasarkan ID kategori | `category=6ae974bc4ed88a7073550e1c` |
| `search` | Cari di judul dan deskripsi (tidak membedakan huruf besar dan kecil) | `search=belajar` |
| `sort` | Urutan: `created_at`, `updated_at`, `title`, `completed`. Awali `-` untuk terbalik, pisahkan dengan koma untuk beberapa kolom (bawaan `-created_at`) | `sort=-title` |

Contoh gabungan:

```
GET /api/todos?completed=false&search=tugas&sort=-created_at&page=1&limit=5
```

Nilai yang tidak valid ditolak dengan status `400` dan pesan yang jelas, misalnya `page=abc` atau `limit=999`.

`GET /api/logs` menerima `page`, `limit`, dan `action` (`create`, `update`, atau `delete`).

## Contoh Penggunaan

### Registrasi

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Tester",
  "email": "tester@example.com",
  "password": "rahasia123"
}
```

Response `201 Created`:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "user": {
      "name": "Tester",
      "email": "tester@example.com",
      "role": "user",
      "archived": false,
      "_id": "6ae95527db568b2cd8b41d91"
    }
  }
}
```

### Membuat todo

```http
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Belajar Swagger",
  "description": "Menulis dokumentasi API",
  "category": "6ae974bc4ed88a7073550e1c"
}
```

### Daftar todo dengan pagination

```http
GET /api/todos?page=1&limit=2&sort=-title
Authorization: Bearer <token>
```

```json
{
  "success": true,
  "results": 2,
  "pagination": { "page": 1, "limit": 2, "total": 8, "totalPages": 4 },
  "data": {
    "todos": [
      {
        "_id": "6aebfe7b30934c79360e8399",
        "title": "Todo tambahan untuk tes pagination",
        "completed": false,
        "category": { "_id": "6ae974bc4ed88a7073550e1c", "name": "Kuliah Semester 5" }
      }
    ]
  }
}
```

### Statistik dengan API Key

```http
GET /api/stats
x-api-key: <API_KEY dari file .env>
```

```json
{
  "success": true,
  "data": {
    "users": 3,
    "categories": 2,
    "todos": { "total": 7, "completed": 1, "pending": 6, "completionRate": 14 },
    "todosPerCategory": [
      { "category": "Kuliah Semester 5", "total": 5 },
      { "category": "Pribadi", "total": 2 }
    ]
  }
}
```

## Format Response dan Kode Status

Response sukses selalu memiliki `"success": true`, sedangkan error memiliki `"success": false` dan `message`.

```json
{
  "success": false,
  "message": "Judul todo wajib diisi"
}
```

| Kode | Arti | Contoh penyebab |
|---|---|---|
| `200` | Berhasil | Data berhasil diambil, diubah, atau dihapus |
| `201` | Dibuat | Registrasi, todo, atau kategori baru |
| `400` | Input tidak valid | Judul kosong, ID tidak valid, `page=abc` |
| `401` | Belum login | Token tidak ada, salah, atau kedaluwarsa; API Key tidak disertakan |
| `403` | Tidak berhak | User biasa mengakses `/api/users`; API Key salah |
| `404` | Tidak ditemukan | Route tidak ada, atau data bukan milik pengguna |
| `409` | Konflik | Email sudah terdaftar |
| `500` | Kesalahan server | Kesalahan tak terduga |

## Keamanan

- Kata sandi di-hash dengan **bcrypt** sebelum disimpan dan tidak pernah dikirim kembali dalam response.
- Autentikasi memakai **JWT** dengan masa berlaku yang dapat diatur.
- Data **todo dan kategori hanya dapat diakses pemiliknya**. Mengakses data milik orang lain menghasilkan `404`.
- Pembaruan todo hanya menerima kolom yang diizinkan (`title`, `description`, `completed`, `category`), sehingga kepemilikan tidak bisa dialihkan lewat request.
- Role `admin` tidak bisa didapat lewat registrasi.
- Endpoint statistik dilindungi **API Key** yang dibandingkan dengan teknik yang aman terhadap serangan waktu (timing attack).
- Pencarian memakai teks yang di-escape, sehingga tidak rentan terhadap injeksi regular expression.
- Seluruh input divalidasi sebelum diproses.
- File `.env` dikecualikan dari Git. Gunakan `.env.example` sebagai acuan.

## Pengujian

Pengujian memakai **Jest** dan **Supertest**.

```bash
npm test
```

| Jenis | Berkas | Cakupan |
|---|---|---|
| Integration | `tests/auth.test.js` | registrasi, login, validasi, email duplikat |
| Integration | `tests/todo.test.js` | CRUD todo, pagination, filter, sorting, search, validasi query, kepemilikan data, activity log |
| Integration | `tests/stats.test.js` | endpoint statistik dan API Key |
| Integration | `tests/app.test.js` | server hidup dan route tidak ditemukan |
| Unit | `tests/unit/middlewares.test.js` | `AppError`, `catchAsync`, `restrictTo`, middleware API Key |

Seluruhnya terdiri dari **41 test**. Semua test memakai **database terpisah bernama `todo_api_test`** pada cluster yang sama dengan `MONGODB_URI`, dan database itu dihapus setelah pengujian selesai, sehingga data asli tidak tersentuh. Test akan berhenti dengan error jika koneksi ternyata bukan ke database test.

## Membuat Akun Admin

Registrasi selalu menghasilkan role `user`. Untuk menjadikan sebuah akun admin, ubah field `role` pada dokumen user di koleksi `users` menjadi `admin`, misalnya lewat MongoDB Atlas atau MongoDB Compass. Perubahan langsung berlaku tanpa perlu login ulang.

## Pembuat

Dibuat oleh **Fanzv** ([@fanzv23](https://github.com/fanzv23)).

Lisensi: ISC
