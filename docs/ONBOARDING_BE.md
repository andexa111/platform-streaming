# 🛠️ Onboarding Guide — Backend Developer

Panduan setup untuk developer backend di project **Lalakon** (lalakon.id).

---

## 1. Install Software yang Dibutuhkan

| Software | Versi Minimum | Cara Cek | Link Download |
|----------|--------------|----------|---------------|
| **Node.js** | v18+ (disarankan v20 LTS) | `node -v` | [nodejs.org](https://nodejs.org/) |
| **npm** | v9+ | `npm -v` | Bundled di Node.js |
| **Git** | v2.30+ | `git -v` | [git-scm.com](https://git-scm.com/) |
| **MySQL** | v8.0 | `mysql --version` | [dev.mysql.com](https://dev.mysql.com/downloads/mysql/) |
| **VS Code** | Terbaru | — | [code.visualstudio.com](https://code.visualstudio.com/) |

### Alternatif MySQL
- **XAMPP** — sudah bundle MySQL + phpMyAdmin → [apachefriends.org](https://www.apachefriends.org/)
- **Laragon** — ringan, auto-start MySQL → [laragon.org](https://laragon.org/)
- **Docker** — `docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:8.0`

### Ekstensi VS Code yang Direkomendasikan
- **ESLint** — linting otomatis
- **Prettier** — format otomatis
- **Prisma** — syntax highlight & autocomplete schema.prisma
- **REST Client** atau **Thunder Client** — test API langsung dari VS Code
- **MySQL** (by Weijan Chen) — lihat database langsung dari VS Code

---

## 2. Clone Repository

```bash
git clone https://github.com/andexa111/platform-streaming.git
cd platform-streaming
```

---

## 3. Install Dependencies

```bash
npm install
```

> ⚠️ Selalu install dari **root folder**, bukan dari `apps/backend`.

---

## 4. Setup MySQL Database

### Buat database baru:

```sql
-- Buka MySQL CLI atau phpMyAdmin, lalu jalankan:
CREATE DATABASE lalakon_db;
```

### Jika pakai XAMPP:
1. Buka XAMPP → Start **MySQL**
2. Buka phpMyAdmin di `http://localhost/phpmyadmin`
3. Klik **New** → Buat database `lalakon_db`

### Jika pakai Laragon:
1. Start Laragon → MySQL otomatis aktif
2. Klik **Database** → Buat database `lalakon_db`

---

## 5. Setup Environment Variables

Copy `.env.example` jadi `.env` di root:

```bash
copy .env.example .env
```

Edit file `.env` dan isi value-nya:

```env
# ===== DATABASE =====
# Sesuaikan user/password MySQL kamu
DATABASE_URL="mysql://root:@localhost:3306/lalakon_db"
# Jika MySQL pakai password:
# DATABASE_URL="mysql://root:password123@localhost:3306/lalakon_db"

# ===== AUTH =====
JWT_SECRET="ganti-dengan-random-string-panjang"
JWT_EXPIRATION="7d"

# ===== BUNNY.NET =====
# Daftar di bunny.net, buat Storage Zone, ambil key-nya
BUNNY_API_KEY=""
BUNNY_STORAGE_ZONE=""
BUNNY_STREAM_LIBRARY_ID=""
BUNNY_TOKEN_SECURITY_KEY=""

# ===== RESEND (Email) =====
# Daftar di resend.com, ambil API key
RESEND_API_KEY=""

# ===== MIDTRANS (Payment) =====
# Daftar Midtrans Sandbox, ambil key dari dashboard
MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""
MIDTRANS_IS_PRODUCTION="false"

# ===== FRONTEND =====
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

> 💡 **Untuk awal development**, cukup isi `DATABASE_URL` dan `JWT_SECRET` saja. Yang lain bisa diisi nanti saat fitur terkait dikerjakan.

---

## 6. Jalankan Prisma Migration

Ini akan membuat tabel di database berdasarkan `schema.prisma`:

```bash
cd apps/backend
npx prisma migrate dev --name init
```

### Perintah Prisma yang sering dipakai:

| Perintah | Fungsi |
|----------|--------|
| `npx prisma migrate dev --name nama_migrasi` | Buat & jalankan migration baru |
| `npx prisma studio` | Buka GUI database di browser (port 5555) |
| `npx prisma generate` | Regenerate Prisma Client setelah ubah schema |
| `npx prisma db push` | Push schema ke DB tanpa migration file (dev cepat) |
| `npx prisma migrate reset` | Reset database (HAPUS SEMUA DATA!) |

---

## 7. Jalankan Development Server

### Backend saja:
```bash
npm run dev --workspace=apps/backend
```
Backend berjalan di: **http://localhost:3001**

### Semua app (FE + BE):
```bash
npx turbo run dev
```

### Ubah port backend (opsional):
Edit file `apps/backend/src/main.ts`:
```ts
await app.listen(3001); // ubah port di sini
```

---

## 8. Struktur Folder Backend

```
apps/backend/
├── prisma/
│   ├── schema.prisma          ← 📦 Model database (User, Film, dll)
│   └── migrations/            ← History perubahan database
├── src/
│   ├── main.ts                ← Entry point, bootstrap app
│   ├── app.module.ts          ← Root module
│   ├── app.controller.ts      ← Root controller
│   ├── app.service.ts         ← Root service
│   │
│   ├── auth/                  ← 🔐 Autentikasi (Minggu 2)
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/               ← Data Transfer Objects
│   │   └── guards/            ← JWT Guard, Roles Guard
│   │
│   ├── films/                 ← 🎬 Manajemen Film (Minggu 3)
│   │   ├── films.module.ts
│   │   ├── films.controller.ts
│   │   ├── films.service.ts
│   │   └── dto/
│   │
│   ├── subscriptions/         ← 💳 Subscription (Minggu 5)
│   ├── payments/              ← 💰 Payment & Webhook (Minggu 5)
│   ├── ads/                   ← 📺 Iklan (Minggu 4)
│   ├── storage/               ← ☁️ Bunny.net Service (Minggu 3)
│   ├── mail/                  ← 📧 Resend Email (Minggu 2)
│   └── scheduler/             ← ⏰ Cron Jobs (Minggu 6)
│
├── test/                      ← E2E tests
├── package.json
└── tsconfig.json
```

---

## 9. Cara Kerja NestJS (Ringkas)

### Pola dasar NestJS: **Module → Controller → Service**

```
Request masuk
    ↓
Controller (terima request, validasi input)
    ↓
Service (logic bisnis, query database)
    ↓
Response keluar
```

### Contoh membuat modul baru:

```bash
# Generate module + controller + service sekaligus
cd apps/backend
npx nest generate resource auth --no-spec
```

Ini akan otomatis membuat:
- `src/auth/auth.module.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/dto/`
- `src/auth/entities/`

---

## 10. Import Shared Package

```ts
// Import types
import type { User, Film, ApiResponse } from '@lalakon/shared';

// Import constants
import { Role, PLAN_CONFIG, SIGNED_URL_DURATION_SUBSCRIBER } from '@lalakon/shared';

// Import validators (untuk referensi validasi)
import { registerSchema } from '@lalakon/shared';
```

---

## 11. Perintah Penting

| Perintah | Fungsi |
|----------|--------|
| `npm install` | Install semua deps (dari root) |
| `npm run dev --workspace=apps/backend` | Jalankan backend dev server |
| `npx turbo run dev` | Jalankan FE + BE |
| `npx turbo run build` | Build semua app |
| `npm run test --workspace=apps/backend` | Jalankan unit tests |
| `npm run test:e2e --workspace=apps/backend` | Jalankan e2e tests |

---

## 12. Tools Eksternal yang Perlu Didaftarkan

Daftar akun di layanan berikut (gratis untuk development):

| Layanan | Kegunaan | Kapan Butuh | Link |
|---------|----------|-------------|------|
| **Midtrans Sandbox** | Payment gateway | Minggu 5 | [dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com) |
| **Bunny.net** | CDN & video storage | Minggu 3 | [bunny.net](https://bunny.net) |
| **Resend** | Email transaksional | Minggu 2 | [resend.com](https://resend.com) |

> 💡 Tidak perlu daftar semua sekarang. Daftar sesuai minggu roadmap.

---

## 13. Git Workflow

```bash
# Buat branch baru
git checkout -b feat/auth-register

# Commit
git add .
git commit -m "feat(auth): implement register endpoint"

# Push
git push origin feat/auth-register
```

### Format Commit:
- `feat(module): ...` — fitur baru
- `fix(module): ...` — perbaikan bug
- `refactor(module): ...` — refaktor
- `test(module): ...` — tambah/ubah test

---

## 14. Debugging Tips

### Lihat isi database:
```bash
cd apps/backend
npx prisma studio
```
→ Buka `http://localhost:5555` di browser

### Test API endpoint:
Gunakan **Postman**, **Insomnia**, atau ekstensi **REST Client** di VS Code.

### Lihat log NestJS:
NestJS otomatis print log di terminal. Perhatikan warna:
- 🟢 Hijau = sukses
- 🔴 Merah = error
- 🟡 Kuning = warning

---

## ❓ FAQ

**Q: `npx prisma migrate dev` error "Can't reach database"?**
A: Pastikan MySQL sudah running dan `DATABASE_URL` di `.env` benar (user, password, port).

**Q: Error "Cannot find module '@lalakon/shared'"?**
A: Jalankan `npm install` dari root folder, bukan dari `apps/backend`.

**Q: Bagaimana reset database?**
A: `cd apps/backend && npx prisma migrate reset` (⚠️ ini hapus semua data!)

**Q: Port 3001 bentrok?**
A: Edit port di `apps/backend/src/main.ts` → `await app.listen(3002);`

---

> 📝 **Roadmap kamu dimulai dari Minggu 2 (Auth System).** Minggu 1 (setup) sudah selesai. Happy coding! 🚀
