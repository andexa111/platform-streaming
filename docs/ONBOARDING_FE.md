# 🚀 Onboarding Guide — Frontend Developer

Panduan setup untuk developer frontend yang baru bergabung di project **Lalakon** (lalakon.id).

---

## 1. Install Software yang Dibutuhkan

Pastikan software berikut sudah terinstall di laptopmu:

| Software | Versi Minimum | Cara Cek | Link Download |
|----------|--------------|----------|---------------|
| **Node.js** | v18+ (disarankan v20 LTS) | `node -v` | [nodejs.org](https://nodejs.org/) |
| **npm** | v9+ (otomatis dari Node.js) | `npm -v` | Sudah bundled di Node.js |
| **Git** | v2.30+ | `git -v` | [git-scm.com](https://git-scm.com/) |
| **VS Code** | Terbaru | — | [code.visualstudio.com](https://code.visualstudio.com/) |

### Ekstensi VS Code yang Direkomendasikan
- **ESLint** — linting otomatis
- **Prettier** — format otomatis
- **Tailwind CSS IntelliSense** — autocomplete class Tailwind
- **Prisma** — syntax highlight schema (opsional, untuk lihat schema BE)

---

## 2. Clone Repository

```bash
git clone https://github.com/andexa111/platform-streaming.git
cd platform-streaming
```

---

## 3. Install Dependencies

Jalankan dari **root folder** (bukan dari `apps/frontend`):

```bash
npm install
```

> ⚠️ **Penting:** Karena ini monorepo (Turborepo + npm workspaces), SELALU install dari root. Jangan `cd apps/frontend && npm install` sendiri.

---

## 4. Setup Environment Variables

Copy file `.env.example` lalu rename jadi `.env`:

```bash
# Di root folder
copy .env.example .env
```

Untuk frontend, yang perlu diisi:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> Minta value `.env` lainnya ke tim backend jika dibutuhkan.

---

## 5. Jalankan Development Server

### Jalankan frontend saja:
```bash
npm run dev --workspace=apps/frontend
```
Frontend akan berjalan di: **http://localhost:3000**

### Jalankan semua app (FE + BE sekaligus):
```bash
npx turbo run dev
```

---

## 6. Struktur Folder yang Perlu Kamu Tahu

```
lalakon/
├── apps/
│   └── frontend/              ← 🎯 KAMU KERJA DI SINI
│       ├── src/
│       │   ├── app/           ← halaman (App Router Next.js 14)
│       │   ├── components/    ← komponen UI
│       │   │   └── ui/        ← komponen shadcn/ui
│       │   ├── hooks/         ← custom hooks (useAuth, usePlayer, dll)
│       │   └── lib/           ← utilities (axios instance, helpers)
│       ├── public/            ← asset statis (gambar, favicon)
│       └── package.json
│
├── packages/
│   └── shared/                ← ⚡ TYPES & CONSTANTS BERSAMA
│       └── src/
│           ├── types/         ← TypeScript interfaces (User, Film, dll)
│           ├── constants/     ← Enum & config (Role, Plan, durasi stream)
│           └── validators/    ← Zod schemas (form validasi)
│
└── package.json               ← root monorepo config
```

---

## 7. Cara Pakai Shared Package

Import types, constants, atau validators dari `@lalakon/shared`:

```tsx
// Import types
import type { Film, User, ApiResponse } from '@lalakon/shared';

// Import constants
import { Role, Plan, PLAN_CONFIG } from '@lalakon/shared';

// Import validators (untuk form)
import { registerSchema, loginSchema } from '@lalakon/shared';
import type { RegisterInput, LoginInput } from '@lalakon/shared';
```

---

## 8. Tech Stack yang Perlu Dipahami

| Teknologi | Kegunaan | Docs |
|-----------|----------|------|
| **Next.js 14** (App Router) | Framework React | [nextjs.org/docs](https://nextjs.org/docs) |
| **Tailwind CSS** | Styling | [tailwindcss.com/docs](https://tailwindcss.com/docs) |
| **shadcn/ui** | Komponen UI siap pakai | [ui.shadcn.com](https://ui.shadcn.com/) |
| **Axios** | HTTP client ke API | [axios-http.com](https://axios-http.com/) |
| **Zod** | Validasi form | [zod.dev](https://zod.dev/) |
| **React Hook Form** | Manajemen form | [react-hook-form.com](https://react-hook-form.com/) |
| **Lucide React** | Icon library | [lucide.dev](https://lucide.dev/) |

---

## 9. Perintah Penting

| Perintah | Fungsi |
|----------|--------|
| `npm install` | Install semua dependencies (dari root) |
| `npm run dev --workspace=apps/frontend` | Jalankan frontend dev server |
| `npx turbo run dev` | Jalankan FE + BE bersamaan |
| `npx turbo run build` | Build semua app |
| `npx turbo run lint` | Lint semua app |
| `npx shadcn@latest add button` | Tambah komponen shadcn/ui baru |

---

## 10. Git Workflow

```bash
# Buat branch baru untuk fitur
git checkout -b feat/nama-fitur

# Setelah selesai, commit & push
git add .
git commit -m "feat: deskripsi singkat perubahanmu"
git push origin feat/nama-fitur

# Buat Pull Request di GitHub
```

### Format Commit Message:
- `feat: ...` — fitur baru
- `fix: ...` — perbaikan bug
- `style: ...` — perubahan styling/UI
- `refactor: ...` — refaktor kode tanpa ubah fitur

---

## ❓ FAQ

**Q: Kenapa `npm install` error?**
A: Pastikan Node.js versi 18+. Cek dengan `node -v`.

**Q: Kenapa import `@lalakon/shared` error?**
A: Pastikan kamu install dari root folder, bukan dari `apps/frontend`.

**Q: Bagaimana menambah komponen shadcn/ui baru?**
A: Dari folder `apps/frontend`, jalankan: `npx shadcn@latest add [nama-komponen]`

**Q: Port 3000 sudah dipakai?**
A: Jalankan dengan port lain: `npm run dev --workspace=apps/frontend -- -p 3001`

---

> 📝 **Catatan:** Jika ada pertanyaan, tanyakan langsung ke tim. Happy coding! 🎬
