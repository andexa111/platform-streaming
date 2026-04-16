# Dokumentasi Backend — Seeder, Film Module & Bunny Service

**Tanggal:** 12 April 2026
**Module:** Database Seeder, Film CRUD, Bunny.net Integration
**Status:** ✅ Selesai & Tested

---

## 1. Daftar File yang Dibuat

| No | File | Tipe | Deskripsi |
|----|------|------|-----------|
| 1 | `prisma/seed.ts` | Seeder | Script untuk mengisi data awal ke database. Menggunakan mekanisme upsert sehingga aman dijalankan berkali-kali tanpa duplikasi. Menambahkan 5 genre film dan 1 akun Super Admin. |
| 2 | `prisma.config.ts` | Config | Konfigurasi Prisma v7 yang memuat path schema, migration, seed command, dan datasource URL dari environment variable. |
| 3 | `src/film/dto/create-film.dto.ts` | DTO | Validasi input untuk pembuatan film baru. Memvalidasi title (wajib, max 200), description, producer, director, duration (angka, min 1), release_year, poster_url, trailer_url, video_id, is_published, scheduled_at, genreIds (array integer), dan actorNames (array string). |
| 4 | `src/film/dto/update-film.dto.ts` | DTO | Validasi input untuk update film. Menggunakan `PartialType` dari `@nestjs/mapped-types` sehingga semua field bersifat opsional, memungkinkan partial update. |
| 5 | `src/film/film.service.ts` | Service | Business logic CRUD film. Berisi 5 fungsi: `create()` untuk membuat film dengan relasi genre/actor, `findAll()` untuk daftar film published dengan search, filter genre, dan pagination, `findAllAdmin()` untuk daftar semua film termasuk draft/deleted, `findOne()` untuk detail film, `update()` untuk partial update termasuk manajemen relasi genre, dan `remove()` untuk soft delete. |
| 6 | `src/film/film.controller.ts` | Controller | Menyediakan 7 endpoint REST API: CRUD admin (create, list all, update, delete), user list, user detail, dan stream URL. |
| 7 | `src/film/film.module.ts` | Module | Module yang mendaftarkan FilmController dan FilmService, serta meng-export FilmService untuk dipakai module lain. |
| 8 | `src/bunny/bunny.service.ts` | Service | Integrasi dengan Bunny.net. Berisi 4 fungsi: `uploadToStorage()` untuk upload file ke Bunny Storage Zone via REST API, `deleteFromStorage()` untuk menghapus file, `generateSignedStreamUrl()` untuk membuat URL streaming dengan token autentikasi SHA256, dan `getStreamVideos()` untuk mengambil daftar video dari Stream Library. |
| 9 | `src/bunny/bunny.module.ts` | Module | Module global yang menyediakan BunnyService ke seluruh aplikasi tanpa perlu import ulang. |
| 10 | `src/upload/upload.controller.ts` | Controller | Endpoint upload file: `POST /upload/poster` (max 5MB, jpg/png/webp) dan `POST /upload/trailer` (max 100MB, mp4/webm/mov). Menggunakan Multer untuk handling multipart form data dan UUID untuk penamaan file unik. |
| 11 | `src/upload/upload.module.ts` | Module | Module yang mendaftarkan UploadController. BunnyService diakses dari global BunnyModule. |

---

## 2. Endpoint API — Film

| No | Method | Endpoint | Auth | Deskripsi | Request | Response |
|----|:------:|----------|:----:|-----------|---------|----------|
| 1 | POST | `/films` | 🔒 Admin | Membuat film baru dengan relasi genre dan actor | Body: `{ title, description, producer, director, duration, release_year, genreIds, actorNames, is_published }` | Film object + genres + actors |
| 2 | GET | `/films` | 🔐 Login | Daftar film yang sudah published. Support search, filter genre, dan pagination. | Query: `?search=&genre=comedy&page=1&limit=10` | `{ data: [...], meta: { total, page, limit, totalPages } }` |
| 3 | GET | `/films/:id` | 🔐 Login | Detail satu film berdasarkan ID. Termasuk data genre dan actor. | Param: `id` | Film object + genres + actors |
| 4 | PATCH | `/films/:id` | 🔒 Admin | Update sebagian data film (partial update). Genre dan actor bisa di-update sekaligus. | Body: field yang ingin diupdate | Film object updated |
| 5 | DELETE | `/films/:id` | 🔒 Admin | Soft delete film. Film tidak dihapus dari database, hanya di-flag `is_deleted: true` dan `is_published: false`. | Param: `id` | `{ message }` |
| 6 | GET | `/films/admin/all` | 🔒 Admin | Daftar semua film termasuk draft dan deleted. Support filter status. | Query: `?search=&status=published|draft|deleted&page=1&limit=10` | `{ data: [...], meta: {...} }` |
| 7 | GET | `/films/:id/stream` | 🔐 Login | Generate signed URL untuk streaming video film. Film harus memiliki `video_id`. URL berlaku 6 jam. | Param: `id` | `{ filmId, title, stream_url }` |

---

## 3. Endpoint API — Upload

| No | Method | Endpoint | Auth | Deskripsi | Request | Response |
|----|:------:|----------|:----:|-----------|---------|----------|
| 1 | POST | `/upload/poster` | 🔒 Admin | Upload gambar poster film ke Bunny Storage. File disimpan di folder `posters/` dengan nama unik UUID. | Form-data: `file` (max 5MB, jpg/png/webp) | `{ url, fileName }` |
| 2 | POST | `/upload/trailer` | 🔒 Admin | Upload video trailer film ke Bunny Storage. File disimpan di folder `trailers/` dengan nama unik UUID. | Form-data: `file` (max 100MB, mp4/webm/mov) | `{ url, fileName }` |

---

## 4. Data Seeder

| No | Tabel | Data | Keterangan |
|----|-------|------|-----------|
| 1 | genres | Comedy, Horror, Action, Historical, Drama | 5 genre awal sesuai konfirmasi client |
| 2 | users | Super Admin (`admin@lalakon.id`) | Role `superadmin`, email otomatis terverifikasi, password dari env |

**Perintah jalankan seeder:**
```bash
npx prisma db seed
```

---

## 5. Alur Upload Poster & Assign ke Film

| No | Langkah | Komponen | Proses |
|----|---------|----------|--------|
| 1 | Admin login | AuthController | Mendapatkan JWT token |
| 2 | Upload file poster | UploadController | `POST /upload/poster` → file divalidasi (max 5MB, format gambar) |
| 3 | File dikirim ke Bunny | BunnyService | Upload via Bunny Storage REST API ke folder `posters/` |
| 4 | CDN URL dikembalikan | UploadController | Response: `https://lalakon-cdn.b-cdn.net/posters/poster-uuid.png` |
| 5 | Update film dengan URL | FilmController | `PATCH /films/:id` dengan body `{ poster_url: "cdn-url" }` |
| 6 | User lihat film | FilmController | `GET /films` → poster_url sudah terisi |

---

## 6. Alur Streaming Video (Signed URL)

| No | Langkah | Komponen | Proses |
|----|---------|----------|--------|
| 1 | Admin upload video | Bunny Dashboard | Video diupload manual ke Stream Library `lalakon-films` |
| 2 | Catat video ID | Admin | Copy video ID dari Bunny Stream dashboard |
| 3 | Assign video ke film | FilmController | `PATCH /films/:id` dengan body `{ video_id: "bunny-video-id" }` |
| 4 | User minta stream | FilmController | `GET /films/:id/stream` |
| 5 | Generate signed URL | BunnyService | Token = SHA256(tokenKey + videoId + expires), URL berlaku 6 jam |
| 6 | Frontend embed video | Frontend | `<iframe src="stream_url">` → video player Bunny |

---

## 7. Integrasi Bunny.net

| No | Service | Konfigurasi | Kegunaan |
|----|---------|-------------|----------|
| 1 | **Storage Zone** (`lalakon-assets`) | Region: Singapore, Host: `sg.storage.bunnycdn.com` | Menyimpan file statis (poster, trailer, ads) |
| 2 | **CDN Pull Zone** (`lalakon-cdn`) | URL: `lalakon-cdn.b-cdn.net` | Distribusi file cepat ke seluruh dunia |
| 3 | **Stream Library** (`lalakon-films`) | Library ID: dari env, Token Auth aktif | Streaming video film dengan transcode otomatis dan DRM |

---

## 8. Dependencies yang Ditambahkan

| No | Package | Fungsi |
|----|---------|--------|
| 1 | `@nestjs/mapped-types` | PartialType untuk UpdateFilmDto (partial update) |
| 2 | `@nestjs/platform-express` | Platform Express untuk file upload (Multer) |
| 3 | `multer` | Middleware untuk handling multipart/form-data |
| 4 | `uuid` | Generate nama file unik (UUID v4) |

---

## 9. Hasil Testing

### A. Seeder

| No | Test Case | Expected | Actual | Status |
|----|-----------|----------|--------|:------:|
| 1 | Genre tersimpan di database | 5 genre (Comedy, Horror, Action, Historical, Drama) | 5 genre tersimpan | ✅ PASS |
| 2 | Super Admin tersimpan | Role superadmin, email verified | Sesuai | ✅ PASS |
| 3 | Login sebagai Super Admin | 200 + JWT token | Login berhasil, role superadmin | ✅ PASS |
| 4 | Seeder idempotent (2x jalan) | Tidak duplikat | Tetap 5 genre, 1 admin | ✅ PASS |

### B. Film Module

| No | Test Case | Expected | Actual | Status |
|----|-----------|----------|--------|:------:|
| 5 | Buat film baru + genre | Film tersimpan dengan genre Comedy & Drama | Film ID 1 + 2 genre terhubung | ✅ PASS |
| 6 | Buat film draft | is_published: false | Draft tersimpan | ✅ PASS |
| 7 | User list film (published) | Hanya film yang published muncul | 1 film (draft tidak muncul) | ✅ PASS |
| 8 | Admin list semua film | Termasuk draft & deleted | 2 film (published + draft) | ✅ PASS |
| 9 | Update film (partial) | Field tertentu saja berubah | Producer + is_published updated | ✅ PASS |
| 10 | Soft delete film | is_deleted: true, is_published: false | Film ditandai terhapus | ✅ PASS |
| 11 | User akses admin endpoint | 403 Forbidden | "Kamu tidak punya akses untuk fitur ini" | ✅ PASS |
| 12 | Filter genre | Hanya film genre tertentu | Filter comedy berhasil (1 film) | ✅ PASS |

### C. Bunny Service

| No | Test Case | Expected | Actual | Status |
|----|-----------|----------|--------|:------:|
| 13 | Upload poster ke Bunny Storage | CDN URL dikembalikan | `https://lalakon-cdn.b-cdn.net/posters/...` | ✅ PASS |
| 14 | File bisa diakses via CDN | 200 + image/png | Status 200, 1652 bytes | ✅ PASS |
| 15 | Generate signed stream URL | URL dengan token & expires | URL + token SHA256 + expires timestamp | ✅ PASS |
| 16 | Upload tanpa token | 401 Unauthorized | 401 Unauthorized | ✅ PASS |

**Total: 16/16 Test PASS** ✅

---

## 10. Environment Variables (Bunny)

| No | Variable | Contoh | Keterangan |
|----|----------|--------|-----------|
| 1 | `BUNNY_STORAGE_API_KEY` | `xxx-xxx-xxx` | API Key dari Bunny Storage Zone (FTP & API Access) |
| 2 | `BUNNY_STORAGE_ZONE` | `lalakon-assets` | Nama Storage Zone |
| 3 | `BUNNY_STORAGE_HOSTNAME` | `sg.storage.bunnycdn.com` | Hostname sesuai region Storage Zone |
| 4 | `BUNNY_CDN_URL` | `https://lalakon-cdn.b-cdn.net` | URL CDN Pull Zone |
| 5 | `BUNNY_STREAM_API_KEY` | `xxx-xxx-xxx` | API Key dari Bunny Stream |
| 6 | `BUNNY_STREAM_LIBRARY_ID` | `632044` | ID library video stream |
| 7 | `BUNNY_STREAM_TOKEN_KEY` | `xxx-xxx-xxx` | Token key untuk generate signed URL |
| 8 | `ADMIN_EMAIL` | `admin@lalakon.id` | Email Super Admin untuk seeder |
| 9 | `ADMIN_PASSWORD` | `admin12345` | Password Super Admin untuk seeder |

---

## 11. Struktur Folder

```
src/
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── mail/
│   ├── mail.module.ts
│   └── mail.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       └── roles.decorator.ts
├── film/                            ← BARU
│   ├── film.module.ts               → Module film
│   ├── film.controller.ts           → 7 endpoint (CRUD + stream)
│   ├── film.service.ts              → Logic CRUD + search + pagination
│   └── dto/
│       ├── create-film.dto.ts       → Validasi buat film
│       └── update-film.dto.ts       → Validasi update film (partial)
├── bunny/                           ← BARU
│   ├── bunny.module.ts              → Module global Bunny.net
│   └── bunny.service.ts             → Upload, delete, signed URL
├── upload/                          ← BARU
│   ├── upload.module.ts             → Module upload
│   └── upload.controller.ts         → POST /upload/poster & trailer
├── app.module.ts
└── main.ts

prisma/
├── schema.prisma                    → 10 tabel, 4 enum
├── seed.ts                          ← BARU: Seeder genre + super admin
└── migrations/
    └── 20260411_init/
```

---

## 12. Rangkuman

| No | Nama | Deskripsi | Screenshot |
|----|------|-----------|:----------:|
| 1 | Seeder genre | Menjalankan `npx prisma db seed` untuk mengisi 5 genre awal (Comedy, Horror, Action, Historical, Drama) ke database secara otomatis menggunakan mekanisme upsert. | |
| 2 | Seeder super admin | Membuat akun Super Admin (`admin@lalakon.id`) dengan role `superadmin` dan email terverifikasi otomatis. Password di-hash dengan bcrypt. | |
| 3 | Buat film baru (admin) | Admin membuat film baru via `POST /films` dengan judul, deskripsi, durasi, genre (many-to-many), dan status draft/published. | |
| 4 | Daftar film (user) | User melihat daftar film yang sudah dipublish via `GET /films` dengan fitur search, filter genre, dan pagination. Film draft tidak tampil. | |
| 5 | Update film (admin) | Admin mengubah data film secara partial via `PATCH /films/:id`. Bisa mengubah 1 field tanpa mengirim semua data. | |
| 6 | Soft delete film (admin) | Admin menghapus film via `DELETE /films/:id`. Film ditandai `is_deleted: true` dan tidak tampil di user, tapi masih bisa dilihat admin. | |
| 7 | Upload poster ke Bunny | Admin upload gambar poster via `POST /upload/poster`. File disimpan ke Bunny Storage dan URL CDN dikembalikan untuk disimpan ke data film. | |
| 8 | Akses poster via CDN | File poster berhasil diakses publik melalui URL CDN Bunny.net (`lalakon-cdn.b-cdn.net`). | |
| 9 | Generate signed stream URL | Sistem membuat URL streaming video dengan token SHA256 dan waktu kedaluwarsa 6 jam via `GET /films/:id/stream`. | |
| 10 | Proteksi role (RBAC) | User biasa ditolak saat mencoba mengakses endpoint admin (create, update, delete film, upload) dengan response 403 Forbidden. | |
