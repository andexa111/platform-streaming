# 📄 Product Requirements Document (PRD): Arsitektur Sistem & Analisis Dockerization

Dokumen ini berisi spesifikasi teknis lengkap dari platform **Sinea**, daftar pustaka yang digunakan, konfigurasi monorepo, serta analisis mendalam mengenai kebutuhan migrasi arsitektur ke dalam kontainer **Docker**.

---

## 1. Spesifikasi Teknologi & Bahasa Pemrograman

Sistem streaming video Sinea dibangun menggunakan arsitektur modern **Monorepo** berbasis **TypeScript** untuk menjaga sinkronisasi model data antara sisi frontend dan backend secara *type-safe*.

### 1.1 Bahasa Pemrograman & Bahasa Kueri
* **TypeScript (v5.x)**: Digunakan di seluruh workspace (Frontend, Backend, dan Shared Packages) untuk pengetikan statis yang kuat.
* **JavaScript (ES6+)**: Bahasa runtime dasar untuk eksekusi kode Node.js.
* **SQL / PostgreSQL**: Dialek database yang digunakan untuk menyimpan metadata film, pengguna, log, transaksi, dan riwayat streaming.
* **HTML5 & CSS3**: Struktur dasar web dan styling kustom untuk visual premium.

---

## 2. Daftar Pustaka (Libraries) & Dependensi Utama

Sistem ini terbagi menjadi 3 bagian utama di dalam direktori monorepo lalakon:

```mermaid
graph TD
    A[Monorepo Root] --> B[apps/frontend - Next.js]
    A --> C[apps/backend - NestJS]
    A --> D[packages/shared - Types/Validators]
    B -->|Imports| D
    C -->|Imports| D
```

### 2.1 Frontend (`apps/frontend`)
Aplikasi client-facing dan admin panel berbasis **Next.js 14 (App Router)**.

| Kategori | Pustaka (Library) | Fungsi Utama |
| :--- | :--- | :--- |
| **Framework Utama** | `next` (v14.2.15) | Server-side rendering (SSR), static site generation (SSG), dan routing halaman. |
| **Video Player Engine** | `@vidstack/react` (v1.12.13) | Pemutar video premium berbasis HLS dengan dukungan kustomisasi UI lengkap. |
| **Styling & Visual** | `tailwindcss` + `tailwind-merge` | Kerangka CSS responsif dengan optimasi utilitas visual kelas premium. |
| **Komponen UI** | `shadcn/ui` + `radix-ui` | Desain antarmuka modular, aksesibel, dan premium. |
| **State Management** | `zustand` (v5.0.12) | Pengelolaan state global aplikasi (otentikasi, tema, dll). |
| **Validasi Form** | `react-hook-form` + `zod` | Penanganan formulir input dan validasi tipe data di sisi client. |
| **Konektivitas API** | `axios` (v1.14.0) | Klien HTTP untuk berkomunikasi dengan backend server. |

### 2.2 Backend (`apps/backend`)
Server utama berbasis **NestJS 11** yang bertindak sebagai penyedia API RESTful.

| Kategori | Pustaka (Library) | Fungsi Utama |
| :--- | :--- | :--- |
| **Framework Utama** | `@nestjs/core` & `@nestjs/common` | Kerangka kerja MVC backend terstruktur. |
| **Database ORM** | `@prisma/client` & `prisma` (v7.6.0) | Pengelolaan skema database PostgreSQL dan query builder. |
| **Autentikasi & Keamanan**| `passport` & `passport-jwt` | Pengamanan endpoint API menggunakan JSON Web Tokens (JWT). |
| **Upload Media** | `multer` & `@types/multer` | Pemrosesan upload berkas gambar poster, logo, dan video intro. |
| **Pemrosesan Gambar** | `sharp` (v0.34.5) | Kompresi gambar poster film secara otomatis di background. |
| **Integrasi Eksternal** | `midtrans-client` (v1.4.3) | Gateway pembayaran untuk transaksi membership pengguna. |
| **Email Service** | `resend` (v6.10.0) | Pengiriman email transaksional (verifikasi akun, reset password). |

### 2.3 Shared Package (`packages/shared`)
Kumpulan pustaka internal yang digunakan bersama oleh Frontend dan Backend.
* **`zod`**: Skema validasi bersama (misal: `loginSchema`, `registerSchema`).
* **TypeScript Types**: Antarmuka tipe data entitas model (User, Film, Banners, Transaksi) agar perubahan skema database terintegrasi secara otomatis ke frontend dan backend tanpa duplikasi kode.

---

## 3. Konfigurasi Lingkungan (Setup & Orchestration)

* **Monorepo Manager**: **NPM Workspaces** untuk manajemen dependency tunggal dari root folder.
* **Build System**: **Turborepo (`turbo`)** untuk mempercepat proses kompilasi melalui caching taktis (cache hit/miss) dan eksekusi paralel tugas-tugas monorepo.
* **Runtime Process Manager**: **PM2** (pada deployment VPS tradisional) untuk menjalankan backend dan frontend Next.js agar tetap hidup (*always-on*) dan auto-restart saat terjadi crash.

---

## 4. Analisis Dockerization: Apakah Perlu Menggunakan Docker?

Berikut adalah analisis komparatif mengenai apakah tim Sinea harus membungkus seluruh monorepo ini ke dalam kontainer **Docker** atau tetap menggunakan deployment VPS tradisional berbasis PM2.

### 4.1 Kelebihan Menggunakan Docker (Pros)
1. **Konsistensi Dependensi Sistem (Khususnya FFmpeg & Sharp)**:
   Proses unggah video intro backend membutuhkan utilitas **FFmpeg** terinstal di OS VPS untuk kompresi video. Tanpa Docker, FFmpeg harus diinstal secara manual pada OS host VPS dengan perintah yang bervariasi bergantung distro Linux (Ubuntu/CentOS). Dengan Docker, kita dapat langsung menyematkan FFmpeg ke dalam resep image backend sehingga di mana pun dijalankan, FFmpeg dijamin ada dan bekerja dengan versi yang tepat.
2. **Isolasi Database & Cache**:
   Jika ingin memigrasikan database PostgreSQL atau Redis ke VPS yang sama, Docker Compose dapat menyiapkannya secara instan dalam hitungan detik tanpa perlu mengonfigurasi user/role database di sistem operasi utama VPS.
3. **Proses Deploy Satu Perintah**:
   Cukup dengan `docker compose up --build -d`, seluruh layanan (database, backend, frontend Next.js, dan worker video) langsung terintegrasi secara otomatis.
4. **Keamanan Ekstra**:
   Semua kode aplikasi berjalan di dalam sandbox container yang terisolasi, mengurangi celah keamanan eksploitasi langsung ke kernel OS VPS.

### 4.2 Tantangan Menggunakan Docker (Cons)
1. **Beban Overhead I/O Pemrosesan Video**:
   Mengingat Sinea adalah aplikasi streaming video, I/O disk sangat intensif (menyimpan intro lokal ke `./public/uploads/intros/`). Jika menggunakan Docker, folder ini harus diekspos keluar melalui **Docker Bind Volumes** agar data video tidak hilang saat kontainer direstart.
2. **Kebutuhan Memori Tinggi saat Build**:
   Membangun aplikasi Next.js (frontend) sangat memakan RAM CPU VPS. Melakukan `npm run build` di dalam Docker Alpine di VPS berspesifikasi rendah (misal: 1 Core, 1GB RAM) sering kali memicu error *Out of Memory* (OOM).

### 4.3 Kesimpulan & Rekomendasi
> [!IMPORTANT]
> **REKOMENDASI DEPLOYMENT**: 
> Sangat direkomendasikan menggunakan **Docker** untuk lingkungan **Staging dan Production** karena menjamin dependensi pihak ketiga (FFmpeg, Sharp, PostgreSQL) siap pakai. Namun, untuk lingkungan **Development Lokal**, developer sebaiknya tetap menjalankan perintah bare-metal (`npx turbo run dev`) agar hot-reloading berjalan responsif tanpa latensi virtualisasi Docker.

---

## 5. Arsitektur Docker yang Diusulkan

Berikut adalah rancangan konfigurasi file Docker untuk mendistribusikan sistem monorepo Sinea.

### 5.1 Dockerfile untuk Backend (`apps/backend/Dockerfile`)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++ 
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci
COPY . .
RUN npx prisma generate --schema=./apps/backend/prisma/schema.prisma
RUN npx turbo run build --filter=backend

# Stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app
# Install FFmpeg untuk pemrosesan video intro di latar belakang
RUN apk add --no-cache ffmpeg
COPY --from=builder /app ./
EXPOSE 3001
CMD ["npm", "run", "start:prod", "--workspace=apps/backend"]
```

### 5.2 Dockerfile untuk Frontend (`apps/frontend/Dockerfile`)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci
COPY . .
RUN npx turbo run build --filter=frontend

# Stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=apps/frontend"]
```

### 5.3 Docker Compose (`docker-compose.yml`)
Diletakkan pada root folder proyek untuk menjalankan seluruh ekosistem:
```yaml
version: '3.8'

services:
  # Database PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: sinea-db
    restart: always
    environment:
      POSTGRES_USER: sinea_user
      POSTGRES_PASSWORD: sinea_secure_password
      POSTGRES_DB: sinea_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Backend Service (NestJS)
  backend:
    build:
      context: .
      dockerfile: ./apps/backend/Dockerfile
    container_name: sinea-backend
    restart: always
    environment:
      - DATABASE_URL=postgresql://sinea_user:sinea_secure_password@postgres:5432/sinea_db?schema=public
      - JWT_SECRET=your_jwt_secret_key
      - PORT=3001
    ports:
      - "3001:3001"
    volumes:
      # Mount folder upload agar persistent di VPS host
      - ./apps/backend/public/uploads:/app/apps/backend/public/uploads
    depends_on:
      - postgres

  # Frontend Service (Next.js)
  frontend:
    build:
      context: .
      dockerfile: ./apps/frontend/Dockerfile
    container_name: sinea-frontend
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=https://sinea.id/api
      - PORT=3000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```
