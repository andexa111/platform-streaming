# 🚀 Setup Guide — Platform Streaming Video

Panduan ini untuk developer yang baru pertama kali join project.

---

## 1. Install Software yang Dibutuhkan

Pastikan sudah terinstall di laptop:

| Software | Versi Minimum | Cara Cek | Link Download |
|----------|---------------|----------|---------------|
| **Node.js** | v18+ | `node -v` | [nodejs.org](https://nodejs.org/) |
| **npm** | v9+ | `npm -v` | (sudah termasuk di Node.js) |
| **Git** | v2+ | `git -v` | [git-scm.com](https://git-scm.com/) |
| **MySQL** | v8.0 | `mysql --version` | [dev.mysql.com](https://dev.mysql.com/downloads/) |
| **VS Code** | Terbaru | — | [code.visualstudio.com](https://code.visualstudio.com/) |

### Ekstensi VS Code yang Disarankan
- **ESLint** — linting otomatis
- **Prettier** — format code otomatis
- **Tailwind CSS IntelliSense** — autocomplete class Tailwind
- **Prisma** — syntax highlighting untuk schema.prisma

---

## 2. Clone Repository

```bash
git clone https://github.com/andexa111/platform-streaming.git
cd platform-streaming
```

---

## 3. Install Dependencies

Cukup jalankan **satu perintah** dari root folder. Karena pakai npm workspaces, ini otomatis install dependencies untuk frontend, backend, dan semua packages sekaligus:

```bash
npm install
```

> ⏳ Tunggu sampai selesai. Ini akan menginstall semua dependencies untuk:
> - `apps/frontend` (Next.js + Tailwind + shadcn/ui)
> - `apps/backend` (NestJS + Prisma)
> - `packages/shared`, `packages/eslint-config`, `packages/typescript-config`

---

## 4. Setup Environment Variables

Copy file `.env.example` dan rename jadi `.env`:

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

Lalu edit file `.env` dan isi value yang diperlukan. Minta ke team lead untuk value yang sensitif (API keys, dll).

---

## 5. Jalankan Project

### Untuk Frontend Developer (FE)

Jalankan **hanya frontend**:

```bash
# Dari root folder
npm run dev --workspace=apps/frontend
```

Atau masuk ke folder frontend:

```bash
cd apps/frontend
npm run dev
```

Buka **http://localhost:3000** di browser.

### Untuk Jalankan Semua (FE + BE)

```bash
# Dari root folder — jalankan frontend & backend bersamaan
npx turbo run dev
```

| App | URL |
|-----|-----|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (NestJS) | http://localhost:3001 |

---

## 6. Struktur Folder yang Perlu Diketahui

```
platform-streaming/
├── apps/
│   ├── frontend/          ← NEXT.JS (FE kerja di sini)
│   │   ├── src/app/       ← Halaman-halaman (routing)
│   │   ├── src/components/← Komponen UI (button, card, dll)
│   │   ├── src/hooks/     ← Custom hooks (useAuth, usePlayer)
│   │   └── src/lib/       ← Utility (axios instance, helpers)
│   └── backend/           ← NESTJS (BE kerja di sini)
│
├── packages/
│   └── shared/            ← Types, constants, validators (dipakai FE & BE)
│       ├── src/types/     ← Interface TypeScript (User, Film, dll)
│       ├── src/constants/ ← Enum & config (Role, Plan, durasi stream)
│       └── src/validators/← Zod schemas (form validation)
│
├── .env.example           ← Template environment variables
├── package.json           ← Root config (workspaces)
└── turbo.json             ← Turborepo config
```

---

## 7. Cara Pakai Shared Package

Import types, constants, atau validators dari `@streaming/shared`:

```tsx
// Import type
import type { Film, User, ApiResponse } from '@streaming/shared';

// Import constants
import { Role, Plan, PLAN_CONFIG } from '@streaming/shared';

// Import validator (untuk form)
import { loginSchema, type LoginInput } from '@streaming/shared';
```

---

## 8. Git Workflow

```bash
# Buat branch baru untuk fitur
git checkout -b feat/nama-fitur

# Setelah selesai coding
git add .
git commit -m "feat: deskripsi singkat perubahan"
git push origin feat/nama-fitur

# Lalu buat Pull Request di GitHub
```

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `npm install` error | Pastikan Node.js v18+. Coba hapus `node_modules` lalu `npm install` ulang |
| Port 3000 sudah dipakai | Kill proses lain atau ubah port di `next.config.mjs` |
| Import `@streaming/shared` error | Pastikan `npm install` sudah jalan dari root folder |
| Tailwind class tidak jalan | Restart dev server (`Ctrl+C` lalu `npm run dev` lagi) |
