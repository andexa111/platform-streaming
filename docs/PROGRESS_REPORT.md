# Laporan Progress — Platform Streaming Lalakon

**Periode:** 1 April 2026 — 11 April 2026
**Repository:** https://github.com/andexa111/platform-streaming

---

# MINGGU 1 — Fondasi & Setup (1-5 April 2026)

---

## Front End

**Persiapan:**
- Riset dan perbandingan framework frontend (React, Vue, Angular) → pilih Next.js 14 karena SSR, SEO, dan performa terbaik
- Perancangan arsitektur frontend: App Router pattern, component-based architecture
- Studi referensi UI/UX dari Netflix, Disney+, dan platform streaming lainnya
- Install dan konfigurasi library pendukung (Tailwind CSS, shadcn/ui, Axios, Zod, React Hook Form, Lucide React)

**Proses:**
- Setup project Next.js 14 dengan TypeScript dan App Router
- Konfigurasi design system: Tailwind CSS v3 dengan CSS variables untuk theming (dark mode ready)
- Implementasi komponen UI dasar menggunakan shadcn/ui (Button, Card, dll)
- Konfigurasi Axios instance untuk komunikasi dengan backend API
- Setup form validation schema menggunakan Zod untuk konsistensi validasi FE-BE
- Optimasi font loading menggunakan next/font (Inter) untuk performa
- Konfigurasi SEO metadata (title, description, OpenGraph)

**Hasil:**
- Frontend development server berjalan stabil di `http://localhost:3000`
- Design system dan component library siap digunakan
- Form validation schema ter-sinkronisasi dengan backend melalui shared package
- Arsitektur frontend scalable untuk penambahan fitur di fase selanjutnya

| No | Tanggal | Deskripsi | Status |
|----|---------|-----------|--------|
| 1 | 1 April 2026 | Riset framework dan perancangan arsitektur frontend | Selesai |
| 2 | 1 April 2026 | Inisialisasi project Next.js 14 (App Router) + TypeScript | Selesai |
| 3 | 1 April 2026 | Konfigurasi Tailwind CSS v3 + design system (CSS variables, theming) | Selesai |
| 4 | 2 April 2026 | Setup shadcn/ui component library + kustomisasi komponen dasar | Selesai |
| 5 | 2 April 2026 | Konfigurasi Axios instance + interceptor untuk API communication | Selesai |
| 6 | 3 April 2026 | Implementasi shared validation schema (Zod) untuk form auth & film | Selesai |
| 7 | 3 April 2026 | Optimasi SEO metadata + font loading + responsive layout foundation | Selesai |

---

## Back End

**Persiapan:**
- Riset dan perbandingan framework backend (Express, Fastify, NestJS) → pilih NestJS karena modular architecture, dependency injection, dan built-in decorator support
- Perancangan arsitektur backend: modular pattern (Module → Controller → Service)
- Analisis requirement bisnis dan perancangan Entity Relationship Diagram (ERD)
- Studi integrasi layanan pihak ketiga: Bunny.net (CDN), Midtrans (Payment), Resend (Email)

**Proses:**
- Setup project NestJS dengan TypeScript, konfigurasi module system
- Perancangan dan implementasi database schema menggunakan Prisma ORM (6 tabel utama + relasi)
- Konfigurasi keamanan: CORS policy, environment variables, JWT preparation
- Dokumentasi API contract dan data flow antara frontend-backend
- Pengumpulan dan analisis requirement detail dari client (role system, hak akses, fitur views, mekanisme iklan)
- Perancangan sistem role-based access control (RBAC) dengan 5 level: guest, user, subscriber, admin, superadmin

**Hasil:**
- Backend development server berjalan stabil di `http://localhost:3001`
- Database schema komprehensif: 6 tabel dengan relasi terstruktur
- RBAC system terdesain dengan hierarki role yang jelas
- Dokumentasi requirement dan spesifikasi sistem tersusun lengkap
- Arsitektur backend siap untuk implementasi fitur Auth System di fase berikutnya

| No | Tanggal | Deskripsi | Status |
|----|---------|-----------|--------|
| 1 | 1 April 2026 | Riset framework dan perancangan arsitektur backend | Selesai |
| 2 | 1 April 2026 | Inisialisasi project NestJS + konfigurasi module system | Selesai |
| 3 | 1 April 2026 | Install dan konfigurasi dependencies (Prisma, JWT, Passport, bcrypt, dll) | Selesai |
| 4 | 2 April 2026 | Perancangan ERD dan implementasi schema Prisma (Users, Films, Subscriptions, Payments, Ads, EmailTokens) | Selesai |
| 5 | 2 April 2026 | Konfigurasi keamanan: CORS, environment variables, port management | Selesai |
| 6 | 3 April 2026 | Dokumentasi data requirement dan checklist data dari client | Selesai |
| 7 | 3 April 2026 | Analisis dan dokumentasi sistem RBAC (5 level role + hak akses) | Selesai |
| 8 | 4 April 2026 | Finalisasi spesifikasi sistem: fitur views, genre film, mekanisme iklan | Selesai |
| 9 | 4 April 2026 | Perancangan tabel tambahan (Genre, Actor, FilmView) untuk fase berikutnya | Selesai |

---

## Monorepo & DevOps

**Persiapan:**
- Riset build system untuk monorepo (Lerna, Nx, Turborepo) → pilih Turborepo karena performa caching dan simplicity
- Perancangan struktur monorepo: apps (frontend, backend) + packages (shared, config)

**Proses:**
- Setup Turborepo dengan npm workspaces untuk parallel development
- Pembuatan shared packages untuk konsistensi codebase antar tim:
  - `@lalakon/shared`: TypeScript types, constants, dan Zod validators
  - `@lalakon/eslint-config`: Aturan linting standar
  - `@lalakon/typescript-config`: Konfigurasi TypeScript per-environment (Next.js, NestJS)
- Setup version control (Git) dan deployment ke GitHub
- Konfigurasi environment management (.env.example)

**Hasil:**
- Monorepo berjalan optimal dengan `npx turbo run dev` (FE + BE simultan)
- Shared packages menjamin konsistensi types dan validasi antara frontend-backend
- Git workflow terstandarisasi dengan commit convention
- Repository GitHub terintegrasi dan up-to-date

| No | Tanggal | Deskripsi | Status |
|----|---------|-----------|--------|
| 1 | 1 April 2026 | Riset dan setup Turborepo monorepo + npm workspaces | Selesai |
| 2 | 1 April 2026 | Pembuatan @lalakon/shared (6 type interfaces, 3 constant modules, 2 validator schemas) | Selesai |
| 3 | 2 April 2026 | Pembuatan @lalakon/eslint-config dan @lalakon/typescript-config | Selesai |
| 4 | 2 April 2026 | Setup environment management dan Git workflow | Selesai |
| 5 | 3 April 2026 | Deployment repository ke GitHub + verifikasi CI | Selesai |

---

## Dokumentasi (Minggu 1)

| No | Tanggal | Dokumen | Status |
|----|---------|---------|--------|
| 1 | 2 April 2026 | Panduan Onboarding Frontend Developer | Selesai |
| 2 | 2 April 2026 | Panduan Onboarding Backend Developer | Selesai |
| 3 | 3 April 2026 | Checklist Data Client (kredensial, harga, konten) | Selesai |
| 4 | 3 April 2026 | Dokumen Data Requirements (struktur database & sumber data) | Selesai |
| 5 | 4 April 2026 | Spesifikasi Sistem Terbaru (role, views, genre, iklan) | Selesai |

---

# MINGGU 2 — Infrastruktur & Database Design (6-11 April 2026)

---

## Infrastruktur — VPS Setup

**Persiapan:**
- Pembelian VPS Alibaba Cloud (2 vCPU, 2GB RAM, 40GB ESSD, Ubuntu 22.04, region Indonesia)
- Perencanaan arsitektur deployment: Nginx reverse proxy → PM2 process manager → NestJS + Next.js

**Proses:**
- Konfigurasi awal VPS: system update, swap memory (2GB), firewall rules (UFW)
- Instalasi runtime environment: Node.js v20.20.2, npm v10.8.2
- Instalasi database server: PostgreSQL 16 (migrasi dari MySQL ke PostgreSQL)
- Instalasi web server: Nginx sebagai reverse proxy untuk frontend (port 3000) dan backend (port 3001)
- Instalasi process manager: PM2 untuk menjaga service tetap berjalan dan auto-restart
- Konfigurasi firewall: allow SSH (port 22), HTTP (port 80), HTTPS (port 443)

**Hasil:**
- VPS aktif dan berjalan stabil di IP 147.139.214.82
- Semua dependencies server terinstall dan siap untuk deployment
- Nginx terkonfigurasi, menampilkan halaman default — siap dikonfigurasi untuk Lalakon
- Server dapat diakses via Alibaba Workbench (browser-based terminal)

| No | Tanggal | Deskripsi | Status |
|----|---------|-----------|--------|
| 1 | 6 April 2026 | Pembelian dan inisialisasi VPS Alibaba Cloud | Selesai |
| 2 | 6 April 2026 | System update + konfigurasi swap 2GB (total RAM efektif 4GB) | Selesai |
| 3 | 6 April 2026 | Instalasi Node.js v20.20.2 + npm v10.8.2 | Selesai |
| 4 | 6 April 2026 | Instalasi PostgreSQL 16 | Selesai |
| 5 | 6 April 2026 | Instalasi dan konfigurasi Nginx reverse proxy | Selesai |
| 6 | 6 April 2026 | Instalasi PM2 process manager | Selesai |
| 7 | 6 April 2026 | Konfigurasi firewall (UFW): SSH, HTTP, HTTPS | Selesai |

---

## Infrastruktur — Layanan Pihak Ketiga

**Persiapan:**
- Analisis kebutuhan layanan cloud: CDN video (Bunny.net), email transaksional (Resend), payment gateway (Midtrans)
- Penyusunan panduan setup per layanan untuk dokumentasi tim

**Proses:**
- Registrasi dan konfigurasi Bunny.net:
  - Pembuatan Stream Library `lalakon-films` (region: Frankfurt + Singapore) untuk hosting dan streaming video film
  - Aktivasi Token Authentication dan Block Direct URL Access untuk keamanan video
  - Pembuatan Storage Zone `lalakon-assets` (region: Singapore + Sydney) untuk file statis (poster, trailer, iklan)
  - Pembuatan Pull Zone CDN `lalakon-cdn` (URL: lalakon-cdn.b-cdn.net) untuk distribusi file statis
  - Pembuatan struktur folder: `posters/`, `trailers/`, `ads/`
- Registrasi Resend untuk email transaksional, pembuatan API Key
- Penyusunan panduan lengkap Midtrans (setup ditunda menunggu email bisnis resmi)

**Hasil:**
- Bunny.net fully configured: Stream library + Storage zone + CDN pull zone
- Resend API Key siap digunakan (verifikasi domain menunggu akses DNS)
- Dokumentasi setup lengkap untuk ketiga layanan tersimpan di repository
- Estimasi biaya bulanan terhitung: ~Rp 42.000 (Bunny) + Rp 0 (Resend free tier)

| No | Tanggal | Deskripsi | Status |
|----|---------|-----------|--------|
| 1 | 6 April 2026 | Registrasi Bunny.net + setup Stream Library `lalakon-films` | Selesai |
| 2 | 6 April 2026 | Aktivasi Token Authentication + keamanan video streaming | Selesai |
| 3 | 6 April 2026 | Setup Storage Zone `lalakon-assets` + folder struktur | Selesai |
| 4 | 6 April 2026 | Setup Pull Zone CDN `lalakon-cdn` (lalakon-cdn.b-cdn.net) | Selesai |
| 5 | 6 April 2026 | Registrasi Resend + pembuatan API Key | Selesai |
| 6 | 6 April 2026 | Penyusunan panduan setup Midtrans (implementasi ditunda) | Selesai |

---

## Database Design

**Persiapan:**
- Analisis kebutuhan data berdasarkan PRD dan diskusi requirement dengan client
- Migrasi database engine dari MySQL ke PostgreSQL untuk fitur yang lebih lengkap dan learning opportunity tim

**Proses:**
- Perancangan ulang database schema: penambahan 4 tabel baru, penggunaan PostgreSQL enum
- Implementasi relasi many-to-many (Film ↔ Genre, Film ↔ Actor) menggunakan implicit pivot tables
- Penambahan tabel FilmView untuk analytics views per film per user
- Penambahan tabel WatchHistory untuk fitur "Lanjutkan Menonton" (Netflix-style continue watching)
- Konfirmasi data dari client: daftar genre awal, harga paket, format video, batasan device

**Hasil:**
- Database schema final: 10 tabel, 4 PostgreSQL enum, relasi terstruktur
- Fitur "Continue Watching" terdesain dengan mekanisme upsert position setiap 15 detik
- Constraint dan unique indexes terdefinisi untuk integritas data
- Daftar konfirmasi client terupdate: 19 dari 44 pertanyaan terjawab

| No | Tanggal | Deskripsi | Status |
|----|---------|-----------|--------|
| 1 | 7 April 2026 | Migrasi schema Prisma dari MySQL ke PostgreSQL | Selesai |
| 2 | 7 April 2026 | Penambahan PostgreSQL enums (Role, SubPlan, SubStatus, PaymentStatus) | Selesai |
| 3 | 7 April 2026 | Penambahan tabel Genre dan relasi many-to-many Film ↔ Genre | Selesai |
| 4 | 7 April 2026 | Penambahan tabel Actor dan relasi many-to-many Film ↔ Actor | Selesai |
| 5 | 7 April 2026 | Penambahan tabel FilmView (tracking views per user per film) | Selesai |
| 6 | 7 April 2026 | Penambahan tabel WatchHistory (continue watching feature) | Selesai |
| 7 | 7 April 2026 | Update field Film (producer, @db.Text) dan User (avatar_url) | Selesai |
| 8 | 7 April 2026 | Penambahan table mapping (@@map) untuk snake_case naming di database | Selesai |
| 9 | 7 April 2026 | Konfirmasi data client: genre, harga, format video, device limit | Selesai |

---

## Dokumentasi (Minggu 2)

| No | Tanggal | Dokumen | Status |
|----|---------|---------|--------|
| 1 | 5 April 2026 | Product Requirements Document (PRD) lengkap | Selesai |
| 2 | 6 April 2026 | Panduan Setup VPS (step-by-step deployment guide) | Selesai |
| 3 | 6 April 2026 | Panduan Setup Bunny.net (Stream + Storage + CDN) | Selesai |
| 4 | 6 April 2026 | Panduan Setup Resend (email API) | Selesai |
| 5 | 6 April 2026 | Panduan Setup Midtrans (payment gateway) | Selesai |
| 6 | 7 April 2026 | Database Schema ERD (visualisasi 10 tabel) | Selesai |
| 7 | 7 April 2026 | Daftar Konfirmasi Client (44 pertanyaan, 19 terjawab) | Selesai |

---

## Rencana Minggu Selanjutnya (Minggu 3 — Auth System & Film Module)

| No | Task | Target |
|----|------|--------|
| 1 | Buat database PostgreSQL di VPS + jalankan Prisma migration | 12 April |
| 2 | Seeder data: genre film (5 genre) + akun Super Admin | 12 April |
| 3 | Implementasi modul Auth: Register + Email Verification (Resend) | 12-13 April |
| 4 | Implementasi modul Auth: Login + JWT Token + Refresh Token | 13-14 April |
| 5 | Setup JWT Guard dan Roles Guard (RBAC) | 14 April |
| 6 | Implementasi modul Film: CRUD (admin) + list & detail (public) | 15-16 April |
| 7 | Integrasi BunnyService: upload poster + generate signed URL | 16-17 April |
| 8 | Testing endpoint Auth & Film (Postman/Insomnia) | 17 April |
