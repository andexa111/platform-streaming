# 🎬 Comprehensive Technical Specification & Learning Blueprint
## Projek: Lalakon — Platform Streaming Video / Film On-Demand

Dokumen ini berisi dokumentasi teknis mendalam mengenai arsitektur, data model, alur kerja (workflow), serta teknologi yang digunakan dalam projek **Lalakon Platform Streaming Video**. Dokumen ini dirancang khusus agar dapat dimasukkan ke AI (seperti Claude AI) untuk menghasilkan modul pembelajaran end-to-end bagi developer.

---

## 📐 1. Ringkasan Eksekutif & Monorepo Architecture

### 1.1 Deskripsi Projek
**Lalakon** adalah platform streaming video/film *On-Demand* berfitur lengkap yang mendukung multi-role user (*guest*, *user*, *subscriber*, *admin*, *superadmin*), monetisasi berbasis langganan (membership plan), integrasi sistem iklan (Ads Engine), riwayat tontonan (watch history & resume playback), serta dashboard Content Management System (CMS) untuk admin.

### 1.2 Arsitektur Monorepo
Projek ini dibangun menggunakan arsitektur **Monorepo** dengan **Turborepo** dan **npm Workspaces**.

```text
platform-streaming/
├── apps/
│   ├── frontend/               # Applications: Next.js 14+ (App Router)
│   └── backend/                # Applications: NestJS (REST API + Microservices Architecture)
├── packages/
│   ├── shared/                 # Shared Package: @streaming/shared (Types, Enums, Zod Schema)
│   ├── eslint-config/          # Tooling: Shared ESLint Configurations
│   └── typescript-config/      # Tooling: Shared tsconfig.json templates
├── prisma.config.ts            # Root Prisma config
├── turbo.json                  # Turborepo build pipeline orchestration
└── package.json                # Root package configuration & workspace definition
```

#### Keuntungan Arsitektur Ini:
1. **Single Source of Truth**: Tipe data TypeScript, enum, dan skema validasi Zod didefinisikan satu kali di `packages/shared` dan langsung digunakan oleh Frontend & Backend.
2. **Optimized Build & Cache**: Turborepo mengoptimalkan eksekusi build dan development server secara paralel dengan caching cerdas.

---

## 🛠️ 2. Tech Stack & Infrastructure

### 2.1 Backend Stack (`apps/backend`)
* **Framework**: NestJS (TypeScript Node.js Framework)
* **Database & ORM**: PostgreSQL + Prisma ORM
* **Authentication**: JWT (JSON Web Tokens), Passport.js (Google OAuth 2.0 Strategy), bcrypt (Password Hashing)
* **Video Streaming & Storage**:
  * **Bunny.net Stream**: Storage video & HLS (HTTP Live Streaming) transcoder.
  * **Cloudflare R2**: Object Storage (S3-compatible) untuk menyimpan asset statis (poster, foto aktor, logo).
* **Mailer**: Nodemailer / SMTP integration (Email verification token & notification).
* **Static Asset Serving**: `@nestjs/serve-static`.

### 2.2 Frontend Stack (`apps/frontend`)
* **Framework**: Next.js 14+ (App Router, Server Components & Client Components)
* **State Management**: Zustand (`useAuthStore` untuk session & auth state management)
* **HTTP Client**: Axios dengan interceptors (pengelolaan JWT token & refresh/error handling)
* **Cookie Management**: `js-cookie` (penyimpanan JWT token aman dengan domain scoping `.sinea.id`)
* **UI & Styling**:
  * **Tailwind CSS**: Utility-first CSS framework
  * **Shadcn UI & Lucide Icons**: UI Component primitives
  * **Framer Motion**: Micro-animations & page transitions
* **Player Integration**: Custom Video Player (HLS playback, tracking detik tontonan, penanganan iklan).

### 2.3 Shared Package Stack (`packages/shared`)
* **Types (`src/types/`)**: TS Interfaces (`User`, `Film`, `Subscription`, `Payment`, `Ad`, `ApiResponse`).
* **Constants (`src/constants/`)**: Enum & Konfigurasi (`Role`, `SubStatus`, `PaymentStatus`, `Plan`).
* **Validators (`src/validators/`)**: Zod Schemas (`loginSchema`, `registerSchema`, `filmSchema`, dll).

---

## 🗄️ 3. Skema Database & Data Model (Prisma ORM)

Database menggunakan **PostgreSQL**. Berikut adalah struktur entitas data dan relasinya:

### 3.1 Enumerations (Enums)
* **`Role`**: `guest`, `user`, `subscriber`, `admin`, `superadmin`
* **`SubStatus`**: `inactive`, `pending`, `active`, `expired`
* **`PaymentStatus`**: `pending`, `paid`, `cancelled`

### 3.2 Diagram Entitas Utama

```mermaid
erDiagram
    USER ||--o{ SUBSCRIPTION : has
    USER ||--o{ PAYMENT : makes
    USER ||--o{ WATCH_HISTORY : maintains
    USER ||--o{ FILM_VIEW : records
    MEMBERSHIP_PLAN ||--o{ SUBSCRIPTION : provides
    MEMBERSHIP_PLAN ||--o{ PAYMENT : prices
    MEMBERSHIP_PLAN ||--o{ DISCOUNT : offers
    FILM }|--|{ GENRE : classified_by
    FILM }|--|{ CATEGORY : belongs_to
    FILM }|--|{ ACTOR : features
    FILM }|--|{ DIRECTOR : directed_by
    FILM }|--|{ PRODUCER : produced_by
    FILM }|--|{ PRODUCTION_HOUSE : released_by
    FILM ||--o{ FEATURED_FILM : highlighted_in
    FILM ||--o{ WATCH_HISTORY : tracked_in
```

### 3.3 Penjelasan Ringkas Model Database (`schema.prisma`)
1. **`User`**: Menyimpan kredensial akun, nama, email, avatar, role, dan tanggal verifikasi email.
2. **`Film`**: Entitas utama film/video. Berisi metadata (`title`, `description`, `duration`, `release_year`, `poster_url`, `trailer_url`), ID video Bunny Stream (`video_id`), detik cuplikan highlight (`clip_start`, `clip_end`), serta status publikasi (`is_published`, `scheduled_at`, `published_start`, `published_end`).
3. **Taxonomy & Metadata Film**:
   * `Genre`, `Category` (relasi Many-to-Many dengan Film)
   * `Actor`, `Director`, `Producer`, `ProductionHouse` (relasi Many-to-Many dengan Film)
4. **`WatchHistory`**: Merekam progres menonton user per film (`last_position` dalam detik, `is_completed`). Unique key: `[userId, filmId]`.
5. **`FilmView`**: Merekam statistik total tayang film (`watched_seconds`, `counted` boolean status).
6. **`MembershipPlan`**: Pilihan paket langganan (`name`, `price`, `duration_months`, `benefits[]`, `max_devices`, `quality`).
7. **`Discount`**: Diskon promo pada paket langganan (persentase `percentage` atau flat `fixed_amount` berbatas waktu `valid_from` - `valid_until`).
8. **`Subscription`**: Status langganan user saat ini (`status`: `active`/`expired`/`pending`, `expired_at`).
9. **`Payment`**: Riwayat transaksi pembayaran (`order_id`, `amount`, `status`).
10. **`Ad`**: Manajemen iklan video (`title`, `duration`, `video_url`, `is_active`) untuk pengguna gratis/non-subscriber.
11. **`FeaturedFilm`**: Pengaturan 10 film unggulan yang muncul di carousel hero utama (`position` 1-10).
12. **`HomeSection`**: Kustomisasi section dinamis di Halaman Utama (Section 1, 2, 3 berdasarkan kategori slug).
13. **`PartnerLogo`**: Slot logo mitra/sponsor di landing page.
14. **`EmailToken`**: Token verifikasi email dan reset password.

---

## ⚡ 4. Arsitektur & Modul Backend (`apps/backend`)

Backend dibangun menggunakan arsitektur NestJS berbasis modul domain-driven:

### 4.1 Daftar Modul Backend
1. **`AuthModule`**: Logika Registrasi, Login, Google OAuth2, Verifikasi Email, Refresh Token, Guard Auth & Roles.
2. **`FilmModule`**: CRUD Film, Filter & Search, Trending/Latest Query, Integration ke Bunny Stream.
3. **`UserModule`**: Manajemen profil user, ganti password, manajemen role oleh admin.
4. **`SubscriptionModule`**: Pengelolaan lifecycle status langganan (Pengecekan tanggal kedaluwarsa, aktivasi).
5. **`PaymentModule`**: Pemrosesan order pembayaran, webhook listener/callback notification status bayar.
6. **`MembershipPlanModule` & `DiscountModule`**: Manajemen paket langganan & skema diskon.
7. **`R2Module` & `UploadModule`**: Upload file gambar/poster ke Cloudflare R2 via Presigned URL / S3 Client.
8. **`AdModule`**: Pengambilan iklan aktif untuk disisipkan ke video player gratis.
9. **`AnalyticsModule`**: Perhitungan statistik total views, total revenue, active subscribers untuk dashboard admin.
10. **`CategoryModule`, `GenreModule`, `ActorModule`, `FeaturedFilmModule`, `HomeSectionModule`, `PartnerLogoModule`**: Modul manajemen taksonomi dan kustomisasi landing page.
11. **`MailModule`**: Pengiriman email otomatis (Welcome Email, Email Verification, Expiry Reminder).

### 4.2 Security & Authentication Flow
```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend (Next.js)
    participant API as Backend (NestJS)
    participant Auth as AuthGuard / JWT Strategy
    participant DB as PostgreSQL (Prisma)

    Client->>API: POST /auth/login (email, password)
    API->>DB: Cari User & Verifikasi Hash Bcrypt
    DB-->>API: User valid
    API-->>Client: Response JWT Token + Profil User
    Note over Client: Simpan Token di Cookie & Zustand Store

    Client->>API: GET /films (Header: Authorization Bearer <token>)
    API->>Auth: Validasi Token Signature & Expiry
    Auth-->>API: Payload User Valid (id, role)
    API->>DB: Fetch Data berdasarkan Role User
    DB-->>API: Data Films
    API-->>Client: Return JSON Data
```

---

## 💻 5. Arsitektur & Struktur Frontend (`apps/frontend`)

Frontend memanfaatkan Next.js App Router dengan pemisahan Route Groups:

### 5.1 Struktur Route & Routing Strategy
* **`(public)`**: Halaman bebas akses (Landing Page, Katalog Film, Detail Film, Kategori, Genre).
* **`(auth)`**: Route autentikasi (`/login`, `/register`, `/verify-email`, `/forgot-password`).
* **`(member)`**: Route terproteksi untuk pengguna login (`/profile`, `/history`, `/membership`, `/checkout`).
* **`admin` / `vR4nTy8cL1` / `xK9mZp2wQ7`**: Halaman Admin CMS terproteksi (Dashboard, Manajemen Film, Manajemen User, Transaksi, Ads, Analytics).
* **`maintenance`**: Halaman pengalihan otomatis jika sistem sedang dalam jadwal maintenance.

### 5.2 Middleware Systems (`middleware.ts`)
Middleware pada Next.js digunakan untuk:
1. **Pengecekan Waktu Maintenance**: Pengalihan otomatis ke `/maintenance` jika jam saat ini berada di antara jam **05:00 - 07:00 WIB** (UTC+7).
2. **Protection Guard**: Proteksi rute admin dan member dari akses pengguna tak berwenang.

### 5.3 State Management & Storage (`auth-store.ts` & `api.ts`)
* **Zustand Store (`useAuthStore`)**:
  * Menyimpan state `user`, `isAuthenticated`, dan `isLoading`.
  * Mengatur penetapan cookie JWT (`token`) dengan opsi domain yang fleksibel (`.sinea.id` untuk deployment production).
  * Method `checkAuth()` untuk re-validasi session user saat app pertama dimuat.
* **Axios API Client (`api.ts`)**:
  * Request interceptor untuk otomatis menyisipkan `Authorization: Bearer <token>`.
  * Response interceptor untuk menangani error `401 Unauthorized` (logout otomatis jika token expired).

---

## 🔄 6. End-to-End Core Business Workflows

### 6.1 Alur Video Streaming & Ad Injection
```mermaid
sequenceDiagram
    autonumber
    actor User as User / Subscriber
    participant FE as Next.js Player
    participant BE as NestJS API
    participant Bunny as Bunny Stream CDN

    User->>FE: Buka Halaman Nonton Film (e.g. /movies/12)
    FE->>BE: GET /films/12 (Bearer Token)
    BE-->>FE: Detail Film + Bunny Video ID + User Role Status
    
    alt User Role == 'user' (Gratis)
        FE->>BE: GET /ads/active
        BE-->>FE: Retrive Video Ad URL & Duration
        FE->>User: Play Video Iklan terlebih dahulu
    end

    FE->>Bunny: Fetch HLS Stream Manifest (.m3u8) via Video ID
    Bunny-->>FE: Stream Video Segments
    FE->>User: Play Video Utama

    loop Setiap 10 Detik Penonton
        FE->>BE: POST /films/watch-history (filmId, last_position)
        BE->>BE: Update WatchHistory Record
    end
```

### 6.2 Alur Pembayaran & Aktivasi Langganan (Payment Workflow)
1. User memilih paket di `/membership`.
2. FE mengirim request buat transaksi ke BE (`POST /payments/checkout`).
3. BE menghitung harga akhir (mengaplikasikan diskon aktif jika ada) dan mencatat record `Payment` (`status: pending`) & `Subscription` (`status: pending`).
4. BE menghasilkan Snap Token / Order ID pembayaran.
5. User menyelesaikan pembayaran.
6. Webhook / Callback Notification diterima oleh BE -> Status `Payment` berubah menjadi `paid` -> Status `Subscription` diubah menjadi `active` dengan kalkulasi tanggal kedaluwarsa `expired_at`.
7. Role User di-upgrade dari `user` menjadi `subscriber`.

---

## 📋 7. Panduan Penggunaan Dokumen Ini untuk Prompting AI (Claude AI)

Bagi developer yang ingin menggunakan dokumen ini untuk meminta Claude AI membuatkan **Modul Belajar Step-by-Step**, kamu bisa menyalin prompt berikut ke Claude AI bersama dengan isi file ini:

> **Rekomendasi Prompt ke Claude AI:**
> *"Saya melampirkan spesifikasi teknis lengkap dari projek platform streaming video bernama **Lakon**. Berdasarkan dokumen ini, tolong buatkan **Modul Pembelajaran Full-Stack Development** step-by-step dari nol (terbagi menjadi beberapa chapter/modul). Setiap modul harus berisi penjelasan teori, arsitektur, latihan coding backend (NestJS + Prisma), frontend (Next.js + Zustand), dan integrasi shared package. Buat modul belajar ini mendalam, terstruktur, dan disertai contoh kode yang aplikatif!"*

---

## 📄 8. Ringkasan Environment Variables (`.env.example`)

```env
# DATABASE
DATABASE_URL="postgresql://user:password@localhost:5432/lalakon_db?schema=public"

# BACKEND CONFIG
PORT=3001
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# BUNNY STREAMING (VIDEO CDN)
BUNNY_STREAM_LIBRARY_ID="your-library-id"
BUNNY_STREAM_API_KEY="your-bunny-api-key"

# CLOUDFLARE R2 (OBJECT STORAGE FOR ASSETS)
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="lalakon-assets"
R2_PUBLIC_DOMAIN="https://assets.sinea.id"

# MAIL CONFIG
MAIL_HOST="smtp.mailtrap.io"
MAIL_PORT=2525
MAIL_USER="your-mail-user"
MAIL_PASS="your-mail-pass"
MAIL_FROM="noreply@lalakon.id"

# FRONTEND CONFIG
NEXT_PUBLIC_API_URL="http://localhost:3001"
```
