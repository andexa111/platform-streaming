# Product Requirements Document (PRD)
# Lalakon — Platform Streaming Video

---

**Versi:** 1.0
**Tanggal:** 5 April 2026
**Penulis:** Tim Development Lalakon
**Domain:** lalakon.id
**Status:** In Development

---

## Daftar Isi

1. [Ringkasan Proyek](#1-ringkasan-proyek)
2. [Tujuan & Latar Belakang](#2-tujuan--latar-belakang)
3. [Target Pengguna](#3-target-pengguna)
4. [Sistem Role & Hak Akses](#4-sistem-role--hak-akses)
5. [Kebutuhan Fungsional](#5-kebutuhan-fungsional)
6. [Kebutuhan Non-Fungsional](#6-kebutuhan-non-fungsional)
7. [Arsitektur Sistem](#7-arsitektur-sistem)
8. [Desain Database](#8-desain-database)
9. [API Specification](#9-api-specification)
10. [Roadmap Pengembangan](#10-roadmap-pengembangan)
11. [Rencana Testing](#11-rencana-testing)
12. [Open Questions](#12-open-questions)

---

## 1. Ringkasan Proyek

**Lalakon** adalah platform streaming video berbasis subscription yang memungkinkan pengguna menonton konten film secara online. Sistem dibangun dengan arsitektur monorepo modern menggunakan Next.js untuk frontend dan NestJS untuk backend.

| Atribut | Detail |
|---------|--------|
| **Nama Proyek** | Lalakon — Platform Streaming Video |
| **Domain** | lalakon.id |
| **Stack Backend** | NestJS + Prisma ORM + MySQL 8.0 |
| **Stack Frontend** | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| **CDN & Storage** | Bunny.net (video streaming + file storage) |
| **Payment Gateway** | Midtrans (bulanan & tahunan) |
| **Email Service** | Resend (verifikasi, notifikasi, reminder) |
| **Repository** | Monorepo (Turborepo) — https://github.com/andexa111/platform-streaming |
| **Mulai Development** | 1 April 2026 |
| **Target Selesai** | 29 Mei 2026 (8 minggu) |

### Tiga Pilar Utama

| Pilar | Deskripsi |
|-------|-----------|
| 🎬 **Streaming Aman** | Video dilindungi Signed URL, akses berbasis role, CDN global via Bunny.net |
| 💳 **Subscription & Payment** | Paket bulanan/tahunan, integrasi Midtrans, auto-expire, riwayat pembayaran |
| 📊 **Manajemen Konten** | CMS admin untuk upload film, jadwal tayang, sistem iklan, analytics views |

---

## 2. Tujuan & Latar Belakang

### Masalah yang Diselesaikan
- Kebutuhan platform streaming video lokal Indonesia yang terjangkau
- Pengelolaan konten film yang terstruktur dan mudah dikelola oleh admin
- Monetisasi konten melalui sistem subscription yang aman dan terpercaya

### Tujuan Bisnis
- Menyediakan platform streaming berkualitas tinggi dengan UX yang premium
- Menghasilkan revenue melalui subscription bulanan dan tahunan
- Menyediakan analytics untuk pengambilan keputusan konten (views, subscriber, revenue)

### Success Metrics
| Metrik | Target |
|--------|--------|
| Load halaman beranda | < 2 detik |
| Uptime server | > 99.5% |
| Waktu buffering video | < 3 detik (via CDN Bunny.net) |
| Flow pembayaran | End-to-end < 3 menit |

---

## 3. Target Pengguna

| Persona | Deskripsi | Kebutuhan Utama |
|---------|-----------|-----------------|
| **Penonton Casual** | Pengguna umum yang ingin menonton film online | Akses mudah, UI intuitif, buffering minimal |
| **Subscriber** | Pengguna yang berlangganan | Nonton film tanpa batas, tanpa iklan |
| **Admin Konten** | Tim operasional yang mengelola film | Upload film mudah, jadwal tayang, monitoring |
| **Super Admin** | Pengelola sistem keseluruhan | Kontrol penuh: user management, analytics, revenue tracking |

---

## 4. Sistem Role & Hak Akses

Sistem memiliki **5 level role** dengan hierarki akses yang jelas:

### 4.1 Guest (Belum Login)
- ✅ Akses semua halaman publik (beranda, daftar film, jadwal tayang)
- ✅ Melihat informasi detail film (judul, sinopsis, genre, aktor, sutradara, dll)
- ❌ **TIDAK bisa melihat trailer** — harus login terlebih dahulu
- ❌ Tidak bisa menonton film
- ❌ Tidak bisa subscribe
- ✅ Bisa mendaftar (register) dan login

### 4.2 User (Sudah Login, Belum Subscribe)
- ✅ Semua akses Guest
- ✅ **Bisa melihat trailer film**
- ❌ **TIDAK bisa menonton film penuh** — hanya trailer saja
- ✅ Bisa melakukan pembayaran subscription
- ✅ Akses dashboard user (status langganan, riwayat pembayaran)

### 4.3 Subscriber (Sudah Login + Sudah Bayar)
- ✅ Semua akses User
- ✅ **Bisa menonton semua film** yang sedang tayang / tersedia di sistem
- ✅ Akses penuh tanpa batasan waktu
- ✅ Nonton tanpa iklan
- ✅ Bisa memperpanjang langganan

### 4.4 Admin
- ✅ **CRUD Film** — input detail film, upload poster, video, trailer
- ✅ **Upload video ke Bunny.net** — admin yang upload, lalu link dimasukkan ke CMS
- ✅ Mengelola konten film (publish, draft, hapus, jadwal tayang, rerun)
- ✅ Upload dan kelola iklan
- ✅ Melihat angka views per film (angka saja, tanpa chart detail)
- ❌ Tidak bisa mengelola user/admin lain

### 4.5 Super Admin (Level Tertinggi)
- ✅ Semua akses Admin
- ✅ Melihat **daftar subscriber** aktif
- ✅ Melihat **daftar user** terdaftar dan status login
- ✅ **Mengatur role** — promote/demote admin
- ✅ Akses **analytics lengkap**: views (chart/grafik), revenue, statistik subscriber
- ✅ CRUD semua data sistem

### 4.6 Matriks Akses

| Fitur | Guest | User | Subscriber | Admin | Super Admin |
|-------|:-----:|:----:|:----------:|:-----:|:-----------:|
| Lihat daftar film & poster | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lihat detail film (info) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lihat trailer | ❌ | ✅ | ✅ | ✅ | ✅ |
| Nonton film penuh | ❌ | ❌ | ✅ | ✅ | ✅ |
| Subscribe / bayar | ❌ | ✅ | ✅ | ❌ | ❌ |
| Dashboard user | ❌ | ✅ | ✅ | ❌ | ❌ |
| Riwayat pembayaran | ❌ | ✅ | ✅ | ❌ | ❌ |
| Upload & kelola film | ❌ | ❌ | ❌ | ✅ | ✅ |
| Kelola iklan | ❌ | ❌ | ❌ | ✅ | ✅ |
| Lihat views (angka) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Lihat views (chart/detail) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Kelola user & admin | ❌ | ❌ | ❌ | ❌ | ✅ |
| Analytics & statistik | ❌ | ❌ | ❌ | ❌ | ✅ |

> **Catatan:** Pengecekan role SELALU dilakukan dari database, bukan dari payload JWT.

---

## 5. Kebutuhan Fungsional

### 5.1 Autentikasi & User Management

| Fitur | Deskripsi |
|-------|-----------|
| **Registrasi** | Daftar akun menggunakan email & password, atau Google OAuth 2.0 |
| **Login & Logout** | Login dengan kredensial atau Google. Logout menghapus token di frontend |
| **Verifikasi Email** | Token unik dikirim via Resend. Satu kali pakai, berlaku 24 jam |
| **Role-based Access** | 5 role dengan JWT guard + Roles guard di setiap endpoint |
| **Refresh Token** | Endpoint untuk memperbarui JWT tanpa paksa login ulang |
| **Manajemen User** | Super Admin dapat melihat, memfilter, dan mengubah role user |

### 5.2 Manajemen Konten Film

#### Informasi Detail Film (Referensi: Netflix)

| Field | Tipe | Keterangan |
|-------|------|-----------|
| Judul | Text | Wajib |
| Sinopsis | Textarea | Deskripsi cerita film |
| Produser | Text | Nama produser |
| Aktor | Multi-input | Daftar aktor (bisa lebih dari 1) |
| Sutradara | Text | Nama sutradara |
| Genre | Multi-select | Pilih dari daftar genre predefined (bisa lebih dari 1) |
| Tahun Rilis | Number | Tahun film dirilis |
| Durasi | Number (menit) | Durasi film dalam menit |
| Poster | File/URL | Gambar poster (JPG/PNG, min 600x900px) |
| Trailer | URL | Link trailer dari Bunny atau YouTube |
| Video Film | URL | Link video film dari Bunny.net |
| Rating Usia | Select | SU, 13+, 17+, 21+ (opsional, belum dikonfirmasi) |
| Jadwal Tayang | DateTime | Tanggal & jam film mulai bisa ditonton |

#### Fitur Konten

| Fitur | Deskripsi |
|-------|-----------|
| **Upload Film** | Admin upload video ke Bunny.net, lalu input link di CMS admin |
| **Upload Poster & Trailer** | Poster (jpg/png) dan trailer URL disimpan bersama metadata |
| **Jadwal Tayang** | Admin set `scheduled_at`. Film otomatis published saat waktu tiba (via cron) |
| **Coming Soon** | H-7 sebelum tayang, poster tampil di beranda dengan label "Coming Soon" |
| **Sistem Rerun** | Admin dapat menjadwalkan penayangan ulang film lama |
| **Edit & Hapus** | Edit metadata. Hapus menggunakan soft delete (`is_deleted`) |

#### Genre Film (Predefined)

Genre disimpan di tabel terpisah. Admin memilih saat input film (bisa lebih dari 1). Daftar default:

```
Drama, Komedi, Aksi, Horror, Romantis, Thriller,
Animasi, Dokumenter, Petualangan, Sci-Fi, Musikal,
Keluarga, Misteri, Fantasi, Perang, Biografi
```

### 5.3 Streaming Video

| Fitur | Deskripsi |
|-------|-----------|
| **Integrasi Bunny.net** | Video disimpan dan distream dari Bunny CDN. Backend generate tiket akses |
| **Signed URL** | Token SHA256 dari tokenSecret + path + expiry. Subscriber: 2 jam |
| **Video Player** | Player mendukung streaming adaptif, tidak bisa di-inspect URL |
| **Akses Berbasis Role** | Backend query role dari DB sebelum generate signed URL |
| **Refresh URL Otomatis** | Frontend request URL baru saat sisa 15 menit — seamless untuk film panjang |
| **Cek Jadwal Tayang** | Film hanya bisa diakses jika `is_published = true` DAN `scheduled_at` sudah terlewati |

### 5.4 Fitur Views / Penghitungan Tayangan

#### Aturan Penghitungan
- View dihitung **per user per film**
- Syarat terhitung 1 view:
  1. User mengakses halaman film
  2. User menekan tombol play
  3. User menonton selama **minimum 5-10 menit**
- **1 user = 1 view per film per 24 jam** (cooldown untuk mencegah data inflated)

#### Tampilan Views per Role

| Data | Admin | Super Admin |
|------|:-----:|:-----------:|
| Angka total views per film | ✅ | ✅ |
| Chart / grafik views | ❌ | ✅ |
| Detail views per user | ❌ | ✅ |
| Dashboard analytics lengkap | ❌ | ✅ |

### 5.5 Subscription & Payment

| Fitur | Deskripsi |
|-------|-----------|
| **Pilihan Paket** | Dua paket: bulanan dan tahunan. Harga dikonfigurasi di backend |
| **Integrasi Midtrans** | Backend buat order ke Midtrans API, user bayar di halaman Midtrans |
| **Aktivasi via Webhook** | HANYA dari webhook Midtrans yang terverifikasi (SHA512 signature) |
| **Idempotency Check** | Cek apakah order sudah diproses — antisipasi webhook duplikat |
| **DB Transaction** | Update payments + subscriptions + users.role dalam satu atomic transaction |
| **Auto Expire** | Cron job harian cabut akses subscriber yang melewati `expired_at` |
| **Perpanjang** | `expired_at` baru = `expired_at` lama + 30/365 hari (bukan dari `now()`) |
| **Riwayat** | User dapat melihat semua transaksi: tanggal, paket, status, nominal |

#### Paket Langganan

| Paket | Harga (default) | Durasi | Benefit |
|-------|-----------------|--------|---------|
| **Bulanan** | Rp 49.000 | 30 hari | Nonton semua film, tanpa iklan |
| **Tahunan** | Rp 499.000 | 365 hari | Nonton semua film, tanpa iklan |

> ⚠️ Harga final belum dikonfirmasi oleh client.

### 5.6 Sistem Iklan

| Fitur | Deskripsi |
|-------|-----------|
| **Status** | Sistem iklan masih ada, format belum final (internal / Google Ads) |
| **Infrastruktur** | Siapkan tabel Ads, upload video iklan, CRUD admin |
| **Kelola Iklan** | Admin upload, aktifkan, nonaktifkan, hapus iklan |
| **Batasan** | Hanya satu iklan aktif di satu waktu |

> ⚠️ Mekanisme kapan/di mana iklan muncul belum dikonfirmasi.

### 5.7 Notifikasi Email (Resend)

| Jenis | Trigger | Konten |
|-------|---------|--------|
| **Verifikasi Email** | Saat register | Link verifikasi, berlaku 24 jam |
| **Konfirmasi Pembayaran** | Setelah webhook subscriber aktif | Paket, nominal, expired_at |
| **Reminder H-3** | 3 hari sebelum expired | "Langganan akan berakhir", link perpanjang |
| **Notif Expired** | Saat cron job cabut akses | "Langganan berakhir", link subscribe |
| **Notif Film Baru** | Film baru di-publish | Judul, poster, link nonton |
| **Notif Rerun** | Film lama dijadwalkan ulang | Judul, jadwal tayang baru |

### 5.8 Halaman Beranda

| Komponen | Deskripsi |
|----------|-----------|
| **Banner Coming Soon** | Tampil H-7 sebelum jadwal tayang |
| **Jadwal Tayang** | List film yang akan dan sudah tayang |
| **Grid Film** | Poster film dengan judul, genre, label status (baru/coming soon/rerun) |

### 5.9 Dashboard

| Dashboard | Fitur |
|-----------|-------|
| **User** | Status langganan, tanggal expired, riwayat pembayaran, tombol perpanjang |
| **Admin** | Kelola film (CRUD), kelola iklan, lihat views (angka) |
| **Super Admin** | Semua fitur admin + kelola admin, analytics (views chart, subscriber, revenue) |

---

## 6. Kebutuhan Non-Fungsional

### 6.1 Performa

| Aspek | Target |
|-------|--------|
| Streaming video | CDN Bunny.net, latensi rendah, video tidak lewat server |
| Load halaman | < 2 detik untuk beranda. Lazy loading untuk daftar film |
| Skalabilitas | Backend stateless (JWT) — bisa scale horizontal |

### 6.2 Keamanan

| Aspek | Implementasi |
|-------|-------------|
| Enkripsi Password | bcrypt dengan cost factor minimum 12 |
| JWT Authentication | Token ditandatangani, disimpan httpOnly cookie atau memory |
| HTTPS Wajib | Semua komunikasi dienkripsi TLS |
| Validasi Webhook | SHA512 signature verification untuk Midtrans |
| Signed URL Video | Token SHA256 dengan expiry, Bunny verifikasi setiap request |
| Rate Limiting | Register, login, webhook endpoint dibatasi |
| Input Validation | Semua input divalidasi di backend (class-validator / Zod) |
| MIME Type Check | Validasi MIME type file upload |

### 6.3 Reliability

| Aspek | Implementasi |
|-------|-------------|
| Error Handling | Global exception filter di NestJS, format konsisten |
| Logging | Winston/Pino untuk semua request, error, dan webhook |
| Idempotency | Webhook payment diproses maksimal satu kali |
| Backup Database | MySQL terjadwal, minimal 7 hari terakhir |

### 6.4 Infrastruktur

| Komponen | Spesifikasi |
|----------|-------------|
| **VPS** | Minimal 2 vCPU, 4GB RAM, 100GB SSD (Ubuntu 22.04) |
| **CDN Video** | Bunny.net Storage Zone + Pull Zone + token authentication |
| **Email** | Resend — gratis 3.000 email/bulan, verifikasi domain |
| **Payment** | Midtrans Sandbox (dev), Production (live) |
| **Database** | MySQL 8.0 + Prisma ORM + connection pooling |

---

## 7. Arsitektur Sistem

### 7.1 Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| **NestJS** | Backend framework — modular, guards, interceptors, cron jobs |
| **Next.js 14** | Frontend framework — App Router, SSR, SEO-friendly |
| **Prisma ORM** | Database ORM — schema-first, type-safe, auto migration |
| **MySQL 8.0** | Database relasional utama |
| **Bunny.net** | CDN + storage untuk video, poster, iklan |
| **Midtrans** | Payment gateway Indonesia |
| **Resend** | Email transaksional |
| **Tailwind CSS** | CSS framework + shadcn/ui components |
| **Turborepo** | Monorepo build system |

### 7.2 Arsitektur High-Level

```
┌──────────────────────────────────────────────────┐
│                    CLIENT                        │
│         Browser (lalakon.id)                     │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│               FRONTEND (Next.js 14)              │
│  ┌─────────┐ ┌──────────┐ ┌────────────────┐    │
│  │  Pages  │ │Components│ │  Hooks/Lib     │    │
│  │  (App   │ │  (UI +   │ │  (useAuth,     │    │
│  │ Router) │ │  Player) │ │   api.ts)      │    │
│  └─────────┘ └──────────┘ └────────────────┘    │
└──────────────────┬───────────────────────────────┘
                   │ REST API (Axios)
                   ▼
┌──────────────────────────────────────────────────┐
│               BACKEND (NestJS)                   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────────┐     │
│  │ Auth │ │Films │ │ Subs │ │  Payments  │     │
│  │Module│ │Module│ │Module│ │  (Webhook) │     │
│  └──────┘ └──────┘ └──────┘ └────────────┘     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────────┐     │
│  │ Ads  │ │ Mail │ │ Cron │ │  Storage   │     │
│  │Module│ │Module│ │ Jobs │ │(Bunny Svc) │     │
│  └──────┘ └──────┘ └──────┘ └────────────┘     │
└───────┬──────────────┬───────────────┬───────────┘
        │              │               │
        ▼              ▼               ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │ MySQL   │   │ Bunny.net│   │ Midtrans │
   │ (Prisma)│   │ (CDN)    │   │(Payment) │
   └─────────┘   └──────────┘   └──────────┘
                                      │
                               ┌──────────┐
                               │  Resend  │
                               │ (Email)  │
                               └──────────┘
```

### 7.3 Struktur Folder Monorepo

```
lalakon/
├── apps/
│   ├── frontend/              ← Next.js 14 (App Router)
│   │   ├── src/
│   │   │   ├── app/           ← Halaman (auth, main, admin, dashboard)
│   │   │   ├── components/    ← UI components + player
│   │   │   ├── hooks/         ← useAuth, usePlayer
│   │   │   └── lib/           ← api.ts (axios), auth helpers
│   │   └── public/            ← Assets statis
│   │
│   └── backend/               ← NestJS
│       ├── src/
│       │   ├── auth/          ← Controller, Service, DTO, Guards
│       │   ├── films/         ← CRUD film, signed URL
│       │   ├── subscriptions/ ← Subscription management
│       │   ├── payments/      ← Midtrans webhooks
│       │   ├── ads/           ← Iklan management
│       │   ├── storage/       ← Bunny.net service
│       │   ├── mail/          ← Resend email service
│       │   └── scheduler/     ← Cron jobs (expire, reminder)
│       └── prisma/            ← Schema & migrations
│
├── packages/
│   ├── shared/                ← @lalakon/shared (types, constants, validators)
│   ├── eslint-config/         ← @lalakon/eslint-config
│   └── typescript-config/     ← @lalakon/typescript-config
│
├── docs/                      ← Dokumentasi proyek
├── turbo.json                 ← Turborepo config
├── package.json               ← Root workspaces config
└── .env.example               ← Template environment variables
```

---

## 8. Desain Database

### 8.1 Entity Relationship Diagram

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Genre   │◄───►│  FilmGenre   │◄───►│   Film   │
└──────────┘     └──────────────┘     └────┬─────┘
                                           │
                 ┌──────────────┐          │
                 │  FilmActor   │◄─────────┤
                 └──────┬───────┘          │
                        │                  │
                 ┌──────▼───────┐   ┌──────▼─────┐
                 │    Actor     │   │  FilmView  │
                 └──────────────┘   └──────┬─────┘
                                           │
┌──────────┐     ┌──────────────┐   ┌──────▼─────┐
│   Ad     │     │ Subscription │◄──┤    User    │
└──────────┘     └──────────────┘   └──────┬─────┘
                                           │
                 ┌──────────────┐   ┌──────▼─────┐
                 │  EmailToken  │◄──┤  Payment   │
                 └──────────────┘   └────────────┘
```

### 8.2 Tabel Database

#### Users
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | Int (PK, Auto) | |
| name | String | Nama lengkap |
| email | String (Unique) | Email login |
| password | String? | Hash bcrypt (nullable untuk Google OAuth) |
| role | Enum | guest, user, subscriber, admin, superadmin |
| email_verified_at | DateTime? | Null = belum verifikasi |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### Films
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | Int (PK, Auto) | |
| title | String | Judul film |
| description | Text? | Sinopsis |
| producer | String? | Produser (BARU) |
| director | String? | Sutradara |
| duration | Int? | Durasi dalam menit |
| release_year | Int? | Tahun rilis |
| poster_url | String? | URL poster di Bunny |
| trailer_url | String? | URL trailer (Bunny/YouTube) |
| video_url | String? | URL video film di Bunny |
| is_published | Boolean | Default: false |
| is_deleted | Boolean | Soft delete, default: false |
| scheduled_at | DateTime? | Jadwal tayang |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### Genres (BARU — predefined)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | Int (PK, Auto) | |
| name | String (Unique) | Nama genre |
| slug | String (Unique) | Slug URL-friendly |

#### FilmGenres (Pivot — many-to-many)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| filmId | Int (FK) | Relasi ke Film |
| genreId | Int (FK) | Relasi ke Genre |

#### Actors (BARU)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | Int (PK, Auto) | |
| name | String | Nama aktor |

#### FilmActors (Pivot — many-to-many)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| filmId | Int (FK) | Relasi ke Film |
| actorId | Int (FK) | Relasi ke Actor |

#### Subscriptions
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | Int (PK, Auto) | |
| userId | Int (FK) | Relasi ke User |
| plan | Enum | monthly, yearly |
| status | Enum | inactive, active, expired |
| expired_at | DateTime? | Tanggal berakhir langganan |
| reminder_sent | Boolean | Flag untuk mencegah duplikat email reminder |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### Payments
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | Int (PK, Auto) | |
| order_id | String (Unique) | Format: LLK-{timestamp}-{userId} |
| userId | Int (FK) | Relasi ke User |
| plan | Enum | monthly, yearly |
| amount | Int | Nominal dalam Rupiah |
| status | Enum | pending, paid, cancelled |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### FilmViews (BARU)
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | Int (PK, Auto) | |
| filmId | Int (FK) | Relasi ke Film |
| userId | Int (FK) | Relasi ke User |
| watched_seconds | Int | Berapa detik user menonton |
| counted | Boolean | Apakah sudah dihitung sebagai 1 view |
| createdAt | DateTime | Timestamp menonton |

#### Ads
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | Int (PK, Auto) | |
| title | String | Nama iklan |
| duration | Int | Durasi dalam detik |
| video_url | String | URL video iklan di Bunny |
| is_active | Boolean | Hanya 1 aktif di satu waktu |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### EmailTokens
| Field | Tipe | Keterangan |
|-------|------|-----------|
| id | Int (PK, Auto) | |
| userId | Int (FK) | Relasi ke User |
| token | String (Unique) | Token verifikasi |
| expiresAt | DateTime | Berlaku 24 jam |
| createdAt | DateTime | Auto |

---

## 9. API Specification

### 9.1 Authentication

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registrasi user baru | Public |
| POST | `/auth/login` | Login dengan email & password | Public |
| GET | `/auth/verify-email?token=xxx` | Verifikasi email | Public |
| POST | `/auth/resend-verification` | Kirim ulang email verifikasi | User |
| POST | `/auth/refresh-token` | Refresh JWT token | User |
| POST | `/auth/google` | Login via Google OAuth | Public |

### 9.2 Films (Public)

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/films` | List film published | Public |
| GET | `/films/:id` | Detail film + cek jadwal | Public |
| GET | `/films/:id/stream` | Generate signed URL | Subscriber |
| POST | `/films/:id/view` | Catat view (dari player) | Subscriber |

### 9.3 Subscription & Payment

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/subscriptions/status` | Cek status langganan aktif | User |
| POST | `/subscriptions/create` | Buat order baru | User |
| POST | `/subscriptions/renew` | Perpanjang langganan | Subscriber |
| POST | `/webhooks/midtrans` | Webhook Midtrans | Public (verified) |
| GET | `/user/payments` | Riwayat pembayaran | User |

### 9.4 Admin — Film Management

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/admin/films` | List semua film (termasuk draft) | Admin |
| POST | `/admin/films` | Buat film baru | Admin |
| PATCH | `/admin/films/:id` | Edit metadata film | Admin |
| DELETE | `/admin/films/:id` | Soft delete film | Admin |
| PATCH | `/admin/films/:id/rerun` | Jadwal tayang ulang | Admin |
| GET | `/admin/films/:id/views` | Data views per film | Admin |

### 9.5 Admin — Ads Management

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/ads/active` | Get iklan aktif (untuk player) | Public |
| GET | `/admin/ads` | List semua iklan | Admin |
| POST | `/admin/ads` | Upload iklan baru | Admin |
| PATCH | `/admin/ads/:id` | Aktifkan/nonaktifkan iklan | Admin |
| DELETE | `/admin/ads/:id` | Hapus iklan | Admin |

### 9.6 Super Admin

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/admin/users` | List semua user + filter | Super Admin |
| GET | `/admin/users/:id` | Detail user + riwayat | Super Admin |
| PATCH | `/admin/users/:id/role` | Ubah role user | Super Admin |
| GET | `/admin/stats` | Statistik (subscriber, revenue) | Super Admin |
| GET | `/admin/stats/views` | Chart views semua film | Super Admin |

---

## 10. Roadmap Pengembangan

**Total: 8 Minggu | 1 April — 29 Mei 2026**

| Minggu | Periode | Fokus | Backend | Frontend |
|--------|---------|-------|---------|----------|
| 1 | 1-5 Apr | **Fondasi & Setup** | Monorepo, NestJS, Prisma schema | Next.js, Tailwind, shadcn/ui |
| 2 | 6-12 Apr | **Auth System** | Register, login, JWT, email verify | Form auth, useAuth hook, guards |
| 3 | 13-19 Apr | **Film & Streaming** | BunnyService, CRUD film, signed URL | Beranda, detail film, player |
| 4 | 20-26 Apr | **Player & Iklan** | Endpoint iklan, CRUD ads | Timer, putar iklan, modal subscribe |
| 5 | 27 Apr-3 Mei | **Payment & Webhook** | Midtrans order, webhook, transaction | Halaman paket, redirect, refresh JWT |
| 6 | 4-10 Mei | **Cron Job & Admin** | Scheduler, CRUD admin film | Admin panel film & iklan |
| 7 | 11-17 Mei | **Dashboard & Polish** | Dashboard endpoints, stats, rerun | Dashboard user, riwayat, admin stats |
| 8 | 18-29 Mei | **Testing & Finalisasi** | Jest, e2e, security, logging | Responsive, error handling, a11y |

---

## 11. Rencana Testing

### 11.1 Testing per Role

| Role | Skenario |
|------|----------|
| **Guest** | Lihat beranda, lihat detail film, TIDAK ada trailer, coba klik tonton → prompt login |
| **User** | Login, lihat trailer, TIDAK bisa nonton film penuh, akses dashboard |
| **Subscriber** | Login, nonton film penuh, tanpa iklan, refresh URL otomatis untuk film 2+ jam |
| **Admin** | Upload film, set jadwal, edit metadata, kelola iklan, lihat angka views |
| **Super Admin** | Semua admin + kelola admin, analytics chart, lihat subscriber |

### 11.2 Testing Kritis

| Skenario | Cara Test |
|----------|-----------|
| **Payment Sandbox** | Gunakan Midtrans Sandbox. Test sukses, gagal, cancel. Verifikasi webhook |
| **Webhook Duplicate** | Kirim webhook sama 2x. Verifikasi hanya 1 aktivasi (idempotency) |
| **Signed URL** | Pastikan URL expired sesuai waktu. Tidak bisa dipakai role lain |
| **Views Counting** | Nonton < 5 menit = 0 view. Nonton > 5 menit = 1 view. Cooldown 24 jam |
| **Cron Job** | Set expired_at ke masa lalu. Jalankan cron. Verifikasi role berubah |
| **Concurrent** | Simulasi beberapa user nonton bersamaan. Server tidak overload |

---

## 12. Open Questions

| # | Pertanyaan | Status |
|---|-----------|--------|
| 1 | Harga paket bulanan & tahunan sudah fix? | ⬜ Belum dikonfirmasi |
| 2 | Iklan internal (client) atau Google Ads? | ⬜ Belum dikonfirmasi |
| 3 | Mekanisme kapan/di mana iklan muncul? | ⬜ Belum dikonfirmasi |
| 4 | Apakah ada rating usia film? (SU, 13+, 17+, 21+) | ⬜ Belum dikonfirmasi |
| 5 | Chart views di admin: per hari, per minggu, atau per bulan? | ⬜ Belum dikonfirmasi |
| 6 | Daftar genre final? | 🟡 Pakai seeder default dulu |
| 7 | Siapa yang daftar akun Bunny/Midtrans/Resend? | ⬜ Belum dikonfirmasi |
| 8 | Budget hosting/VPS bulanan? | ⬜ Belum dikonfirmasi |
| 9 | Logo dan warna brand sudah ada? | ⬜ Belum dikonfirmasi |

---

> **Dokumen ini bersifat living document dan akan terus diperbarui seiring perkembangan proyek.**
