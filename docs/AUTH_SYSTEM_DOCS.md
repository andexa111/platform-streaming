# Dokumentasi Backend — Auth System

**Tanggal:** 12 April 2026
**Module:** Authentication & Authorization
**Status:** ✅ Selesai & Tested

---

## 1. Daftar File yang Dibuat

| No | File | Tipe | Deskripsi |
|----|------|------|-----------|
| 1 | `src/prisma/prisma.service.ts` | Service | Mengelola koneksi ke database PostgreSQL menggunakan Prisma ORM. Menggunakan driver adapter `@prisma/adapter-pg` sesuai standar Prisma v7. Koneksi otomatis dibuka saat aplikasi start dan ditutup saat aplikasi berhenti. |
| 2 | `src/prisma/prisma.module.ts` | Module | Module global yang menyediakan `PrismaService` ke seluruh aplikasi. Menggunakan decorator `@Global()` sehingga tidak perlu di-import ulang di setiap module. |
| 3 | `src/mail/mail.service.ts` | Service | Mengelola pengiriman email menggunakan Resend API. Saat ini berisi fungsi `sendVerificationEmail()` yang mengirim email verifikasi dengan template HTML responsif berisi tombol verifikasi dan link cadangan. |
| 4 | `src/mail/mail.module.ts` | Module | Module yang menyediakan `MailService`. Di-export agar bisa dipakai oleh `AuthModule` untuk mengirim email verifikasi saat registrasi. |
| 5 | `src/auth/dto/register.dto.ts` | DTO | Data Transfer Object untuk validasi input registrasi. Memvalidasi field `name` (min 2, max 50 karakter), `email` (format email valid), dan `password` (min 8, max 32 karakter) menggunakan `class-validator`. |
| 6 | `src/auth/dto/login.dto.ts` | DTO | Data Transfer Object untuk validasi input login. Memvalidasi field `email` (format email valid) dan `password` (wajib string). |
| 7 | `src/auth/auth.service.ts` | Service | Business logic utama untuk autentikasi. Berisi 4 fungsi: `register()` untuk pendaftaran akun baru, `login()` untuk autentikasi dan penerbitan JWT, `verifyEmail()` untuk verifikasi email via token, dan `getProfile()` untuk mengambil data profil user. |
| 8 | `src/auth/auth.controller.ts` | Controller | Menyediakan 4 endpoint REST API untuk autentikasi: `POST /auth/register`, `POST /auth/login`, `GET /auth/verify-email`, dan `GET /auth/profile` (protected). |
| 9 | `src/auth/jwt.strategy.ts` | Strategy | Strategi autentikasi Passport.js untuk memvalidasi JWT token dari header `Authorization: Bearer <token>`. Setiap request yang dilindungi JWT Guard akan melewati validasi ini untuk memastikan token valid dan user masih ada di database. |
| 10 | `src/auth/guards/jwt-auth.guard.ts` | Guard | Guard yang memproteksi endpoint agar hanya bisa diakses oleh user yang sudah login (memiliki JWT token valid). Dipakai dengan decorator `@UseGuards(JwtAuthGuard)`. |
| 11 | `src/auth/guards/roles.guard.ts` | Guard | Guard yang memproteksi endpoint berdasarkan role user. Mengecek apakah role user yang login termasuk dalam daftar role yang diizinkan. Dipakai bersamaan dengan `@UseGuards(JwtAuthGuard, RolesGuard)` dan `@Roles('admin')`. |
| 12 | `src/auth/decorators/roles.decorator.ts` | Decorator | Custom decorator `@Roles()` untuk menentukan role apa saja yang boleh mengakses suatu endpoint. Contoh penggunaan: `@Roles('admin', 'superadmin')`. |
| 13 | `src/auth/auth.module.ts` | Module | Module yang menghubungkan semua komponen auth: `PassportModule`, `JwtModule` (secret key, expiry 7 hari), `MailModule`, `AuthService`, `AuthController`, dan `JwtStrategy`. |
| 14 | `src/main.ts` | Entry Point | File utama aplikasi. Ditambahkan: load `dotenv/config` di baris pertama untuk membaca file `.env`, dan `ValidationPipe` global untuk validasi DTO otomatis dengan opsi `whitelist` dan `transform`. |

---

## 2. Endpoint API

| No | Method | Endpoint | Auth | Deskripsi | Request Body | Response |
|----|:------:|----------|:----:|-----------|-------------|----------|
| 1 | POST | `/auth/register` | ❌ | Mendaftarkan akun baru. Password di-hash dengan bcrypt (salt 10). Membuat token verifikasi (berlaku 24 jam) dan mengirim email verifikasi via Resend. | `{ name, email, password }` | `{ message, user: { id, name, email, role } }` |
| 2 | POST | `/auth/login` | ❌ | Login dengan email dan password. Mengembalikan JWT token (berlaku 7 hari) jika kredensial valid dan email sudah diverifikasi. | `{ email, password }` | `{ message, access_token, user: { id, name, email, role, avatar_url } }` |
| 3 | GET | `/auth/verify-email` | ❌ | Memverifikasi email user. Menerima token via query string. Jika valid, email_verified_at di-set dan role diupgrade dari `guest` ke `user`. Token dihapus setelah dipakai. | Query: `?token=xxx` | `{ message }` |
| 4 | GET | `/auth/profile` | 🔐 JWT | Mengambil data profil user yang sedang login. Membutuhkan header `Authorization: Bearer <token>`. | — | `{ id, name, email, role, avatar_url, email_verified_at, createdAt }` |

---

## 3. Alur Registrasi & Login

| No | Langkah | Komponen | Proses |
|----|---------|----------|--------|
| 1 | User isi form register | Frontend | Input: nama, email, password |
| 2 | Frontend kirim POST `/auth/register` | AuthController | Menerima request, validasi DTO |
| 3 | Cek email duplikat | AuthService | Query `user.findUnique({ email })` — jika ada, return 409 |
| 4 | Hash password | AuthService | `bcrypt.hash(password, 10)` — password tidak pernah disimpan dalam bentuk asli |
| 5 | Simpan user ke database | AuthService | `user.create()` — role default: `guest` |
| 6 | Buat token verifikasi | AuthService | `crypto.randomBytes(32)` — token random 64 karakter hex, berlaku 24 jam |
| 7 | Kirim email verifikasi | MailService | Resend API — template HTML dengan tombol "Verifikasi Email" |
| 8 | User klik link di email | Frontend | Redirect ke `/verify-email?token=xxx` |
| 9 | Frontend kirim GET `/auth/verify-email` | AuthController | Query token, validasi expire |
| 10 | Verifikasi berhasil | AuthService | Set `email_verified_at`, upgrade role `guest` → `user`, hapus token |
| 11 | User login | AuthController | POST `/auth/login` dengan email & password |
| 12 | Validasi kredensial | AuthService | Cek email, bandingkan hash password, cek email verified |
| 13 | Generate JWT token | AuthService | Payload: `{ sub: userId, email, role }`, expire: 7 hari |
| 14 | Return token ke frontend | AuthController | Frontend simpan token, kirim di header untuk request selanjutnya |

---

## 4. Sistem Keamanan

| No | Fitur | Implementasi | Keterangan |
|----|-------|-------------|-----------|
| 1 | **Password Hashing** | bcrypt dengan salt rounds 10 | Password tidak pernah disimpan dalam bentuk plain text |
| 2 | **JWT Token** | HMAC SHA256 (`HS256`) | Token berlaku 7 hari, berisi `userId`, `email`, `role` |
| 3 | **Email Verification** | Token random 64 karakter hex | Berlaku 24 jam, hanya bisa dipakai sekali |
| 4 | **JWT Guard** | `@UseGuards(JwtAuthGuard)` | Memblokir akses endpoint tanpa token valid |
| 5 | **Roles Guard** | `@UseGuards(RolesGuard)` + `@Roles()` | Memblokir akses berdasarkan role user |
| 6 | **DTO Validation** | `class-validator` + `ValidationPipe` | Validasi input otomatis, pesan error dalam Bahasa Indonesia |
| 7 | **Whitelist** | `ValidationPipe({ whitelist: true })` | Field yang tidak ada di DTO otomatis dibuang |
| 8 | **CORS** | `app.enableCors()` | Hanya menerima request dari `FRONTEND_URL` |

---

## 5. Dependencies yang Ditambahkan

| No | Package | Versi | Fungsi |
|----|---------|-------|--------|
| 1 | `resend` | latest | SDK untuk mengirim email via Resend API |
| 2 | `@prisma/adapter-pg` | latest | Driver adapter PostgreSQL untuk Prisma v7 |
| 3 | `pg` | latest | PostgreSQL client untuk Node.js |
| 4 | `dotenv` | latest | Membaca file `.env` ke `process.env` |

---

## 6. Hasil Testing

| No | Test Case | Expected | Actual | Status |
|----|-----------|----------|--------|:------:|
| 1 | Login sebelum verifikasi email | 401 — Email belum diverifikasi | 401 — Email belum diverifikasi. Cek inbox kamu. | ✅ PASS |
| 2 | Login dengan password salah | 401 — Email atau password salah | 401 — Email atau password salah | ✅ PASS |
| 3 | Verifikasi email dengan token valid | 200 — Email berhasil diverifikasi | 200 — Email berhasil diverifikasi! Silakan login. | ✅ PASS |
| 4 | Login setelah verifikasi email | 200 — Dapat JWT + role `user` | 200 — JWT token + role berubah ke `user` | ✅ PASS |
| 5 | Get profile dengan JWT valid | 200 — Data profil lengkap | 200 — id, name, email, role, avatar_url, email_verified_at, createdAt | ✅ PASS |
| 6 | Get profile tanpa JWT | 401 — Unauthorized | 401 — Unauthorized | ✅ PASS |
| 7 | Register dengan email duplikat | 409 — Email sudah terdaftar | 409 — Email sudah terdaftar | ✅ PASS |
| 8 | Register dengan input tidak valid | 400 — Pesan validasi | 400 — Nama minimal 2 karakter, Format email tidak valid, Password minimal 8 karakter | ✅ PASS |

**Total: 8/8 Test PASS** ✅

---

## 7. Environment Variables

| No | Variable | Contoh | Keterangan |
|----|----------|--------|-----------|
| 1 | `DATABASE_URL` | `postgresql://lalakon:xxx@localhost:5432/lalakon_db` | Connection string PostgreSQL |
| 2 | `JWT_SECRET` | `lalakon-super-secret-key-xxx` | Secret key untuk sign JWT token |
| 3 | `PORT` | `3001` | Port backend server |
| 4 | `FRONTEND_URL` | `http://localhost:3000` | URL frontend (untuk CORS dan link email) |
| 5 | `RESEND_API_KEY` | `re_xxxxxxxxxxxx` | API key Resend untuk kirim email |
| 6 | `RESEND_FROM_EMAIL` | `Lalakon <onboarding@resend.dev>` | Alamat pengirim email |

---

## 8. Struktur Folder

```
src/
├── prisma/
│   ├── prisma.module.ts          → Module global koneksi database
│   └── prisma.service.ts         → Service koneksi PostgreSQL (Prisma v7 + adapter-pg)
├── mail/
│   ├── mail.module.ts            → Module email
│   └── mail.service.ts           → Kirim email via Resend API
├── auth/
│   ├── auth.module.ts            → Module auth (JWT + Passport + Mail)
│   ├── auth.controller.ts        → 4 endpoint: register, login, verify, profile
│   ├── auth.service.ts           → Logic: hash, validate, JWT, verify email
│   ├── jwt.strategy.ts           → Validasi JWT token dari header
│   ├── dto/
│   │   ├── register.dto.ts       → Validasi: name (2-50), email, password (8-32)
│   │   └── login.dto.ts          → Validasi: email, password
│   ├── guards/
│   │   ├── jwt-auth.guard.ts     → Proteksi: harus login
│   │   └── roles.guard.ts        → Proteksi: harus role tertentu
│   └── decorators/
│       └── roles.decorator.ts    → Decorator @Roles('admin', 'superadmin')
├── app.module.ts                 → Root module: PrismaModule + AuthModule
└── main.ts                       → Entry point + dotenv + ValidationPipe + CORS
```

---

## 9. Rangkuman

| No | Nama | Deskripsi | Screenshot |
|----|------|-----------|:----------:|
| 1 | Registrasi akun baru | User mengisi form registrasi (nama, email, password). Sistem memvalidasi input, meng-hash password, menyimpan data ke database, dan mengirim email verifikasi ke inbox user. | |
| 2 | Email verifikasi terkirim | Email verifikasi dengan template HTML berisi tombol "Verifikasi Email" berhasil diterima di inbox user melalui layanan Resend API. | |
| 3 | Verifikasi email berhasil | User mengklik link verifikasi di email. Sistem memvalidasi token, mengubah status email menjadi terverifikasi, dan mengupgrade role dari `guest` ke `user`. | |
| 4 | Login berhasil | User login dengan email dan password. Sistem memvalidasi kredensial, memeriksa status verifikasi email, dan mengembalikan JWT token beserta data profil user. | |
| 5 | Akses profil dengan JWT | User mengakses endpoint `/auth/profile` dengan menyertakan JWT token di header. Sistem memvalidasi token dan mengembalikan data profil lengkap. | |
| 6 | Proteksi endpoint tanpa token | User mencoba mengakses endpoint yang dilindungi JWT tanpa menyertakan token. Sistem menolak akses dengan status 401 Unauthorized. | |
| 7 | Validasi input registrasi | Sistem menolak input yang tidak valid (nama terlalu pendek, email salah format, password kurang dari 8 karakter) dengan pesan error dalam Bahasa Indonesia. | |
| 8 | Proteksi email duplikat | Sistem menolak registrasi dengan email yang sudah terdaftar di database dengan status 409 Conflict. | |
