# 📋 Spesifikasi Sistem Lalakon — Catatan Terbaru

> **Terakhir diperbarui:** 4 April 2026
> **Sumber:** Diskusi langsung dengan project owner

---

## 1. Sistem Role & Hak Akses (Diperbarui)

### Guest (Level Paling Rendah — Belum Login)
- ✅ Bisa akses semua halaman umum
- ✅ Bisa melihat informasi detail film (judul, sinopsis, genre, aktor, dll)
- ❌ **TIDAK bisa melihat trailer** — harus login dulu
- ❌ Tidak bisa menonton film
- ❌ Tidak bisa subscribe

### User (Sudah Login, Belum Subscribe)
- ✅ Bisa akses semua halaman
- ✅ Bisa melihat informasi detail film
- ✅ **Bisa melihat trailer film**
- ❌ **TIDAK bisa menonton film penuh** — hanya trailer saja
- ✅ Bisa melakukan payment/subscribe

### Subscriber (Sudah Login + Sudah Bayar)
- ✅ Bisa akses semua halaman
- ✅ Bisa melihat detail film dan trailer
- ✅ **Bisa menonton semua film** yang sedang tayang / tersedia di sistem
- ✅ Akses penuh tanpa batasan waktu, tanpa iklan

### Admin
- ✅ CRUD Film — mengisi detail film, upload video, dll
- ✅ **Upload video film ke Bunny.net** (admin yang upload, lalu link-nya dimasukkan ke CMS)
- ✅ Mengelola konten film (publish, draft, hapus)
- ✅ Upload/kelola iklan
- ✅ Melihat data views film (angka, chart)

### Super Admin (Level Tertinggi)
- ✅ Semua akses Admin
- ✅ Melihat siapa saja yang **berlangganan** (subscriber)
- ✅ Melihat siapa saja yang **login** / terdaftar
- ✅ **Mengatur siapa saja yang jadi Admin** (promote/demote)
- ✅ Akses semua data yang berhubungan dengan sistem
- ✅ Melihat statistik, views, revenue, dll

---

## 2. Film — Struktur Data (Diperbarui)

### Sumber Konten
- Film dikelola secara **dinamis** melalui halaman **CMS Admin**
- File video film disimpan di **Bunny.net**
- **Admin yang upload video ke Bunny**, lalu link/URL video tersebut dimasukkan ke CMS
- Flow upload: Admin upload video ke Bunny → dapat link → input link di form CMS

### Informasi Detail Film (Referensi: Netflix)
Detail film mengikuti standar platform streaming seperti Netflix:

| Field | Keterangan | Input |
|-------|-----------|-------|
| **Judul** | Judul film | Text input |
| **Sinopsis** | Deskripsi cerita | Textarea |
| **Produser** | Nama produser film | Text input |
| **Aktor** | Daftar aktor yang terlibat | Multi-input (bisa lebih dari 1) |
| **Sutradara** | Nama sutradara | Text input |
| **Genre** | Kategori film | **Select dari daftar genre yang sudah disediakan** (bisa pilih lebih dari 1) |
| **Tahun Rilis** | Tahun film dirilis | Number input |
| **Durasi** | Durasi film dalam menit | Number input |
| **Poster** | Gambar poster film | Upload file / URL |
| **Trailer/Cuplikan** | Video trailer singkat | URL (dari Bunny atau YouTube) |
| **Video Film** | Film penuh | **Link video dari Bunny** |
| **Rating** | Rating usia (misal: 13+, 17+, 21+) | Select (opsional, perlu konfirmasi) |

### Genre Film
Genre sudah **disediakan (predefined)** di sistem. Admin tinggal **memilih** saat input film (bisa pilih lebih dari 1).

Daftar genre perlu dikonfirmasi ke client. Contoh:
- Drama
- Komedi
- Aksi
- Horror
- Romantis
- Thriller
- Animasi
- Dokumenter
- Petualangan
- Sci-Fi
- Musikal
- Keluarga
- dll.

---

## 3. Fitur Views / Penghitungan Tayangan (BARU)

### Aturan Penghitungan Views
- View dihitung **per user per film**
- Syarat terhitung 1 view:
  1. User **mengakses halaman film**
  2. User **menekan tombol play**
  3. User **menonton selama minimum 5-10 menit** ✅ (dikonfirmasi)
- Setelah ketiga syarat terpenuhi → **+1 view**
- **1 user = 1 view per film per 24 jam** (supaya data analytics tetap berguna tapi tidak inflated)

### Tampilan Views per Role
| Data | Admin | Super Admin |
|------|-------|-------------|
| Angka total views per film | ✅ **Ya** | ✅ Ya |
| Chart / grafik views | ❌ Tidak | ✅ **Ya** |
| Detail views per user | ❌ Tidak | ✅ **Ya** |
| Dashboard analytics lengkap | ❌ Tidak | ✅ **Ya** |

### Implikasi ke Database
Perlu tabel baru:
```
FilmView
├── id
├── filmId          → relasi ke Film
├── userId          → relasi ke User
├── watched_seconds → berapa detik user menonton
├── counted         → boolean, apakah sudah dihitung sebagai view
├── createdAt       → timestamp kapan menonton
```

---

## 4. Sistem Iklan (Update)

- ✅ **Sistem iklan masih ada**
- ⚠️ **Belum dikonfirmasi**: iklan internal (dari client sendiri) atau iklan dari Google (AdSense/AdMob)
- Untuk sekarang: **siapkan infrastruktur iklan internal dulu** (tabel Ads, upload video iklan, CRUD admin)
- Jika nanti pakai Google Ads, tinggal tambahkan integrasi di frontend

---

## 5. Genre Film

- Daftar genre **belum final** dari client
- Keputusan: **buat seeder dengan genre umum dulu**, nanti bisa ditambah/diubah
- Genre disimpan di tabel terpisah (bukan hardcode)
- Film bisa punya **lebih dari 1 genre** (many-to-many)

### Genre Default (Seeder)
```
Drama, Komedi, Aksi, Horror, Romantis, Thriller,
Animasi, Dokumenter, Petualangan, Sci-Fi, Musikal,
Keluarga, Misteri, Fantasi, Perang, Biografi
```

---

## 6. Perubahan dari Requirement Awal

| Aspek | Requirement Awal | Diperbarui |
|-------|-----------------|------------|
| Guest lihat trailer | ✅ Bisa | ❌ **Tidak bisa** — harus login |
| User gratis nonton 20 menit | ✅ Ada batas 20 menit + iklan | ❌ **Tidak ada** — user hanya bisa lihat trailer |
| Sistem iklan | ✅ Iklan muncul setelah 20 menit | ✅ **Masih ada**, mekanisme kapan muncul belum final |
| Detail film | Judul, genre, sinopsis, durasi | ➕ **Ditambah**: produser, aktor, rating |
| Input video admin | Upload langsung ke Bunny | **Admin upload ke Bunny dulu**, lalu input link di CMS |
| Views film | Tidak ada | ➕ **BARU** — hitung views + chart di admin |

---

## 7. Hal yang Perlu Dikonfirmasi ke Client

| # | Pertanyaan | Status |
|---|-----------|--------|
| 1 | Berapa **menit minimum** menonton agar terhitung 1 view? | ✅ **5-10 menit** |
| 2 | Apakah **sistem iklan masih ada**? | ✅ **Masih ada**, belum jelas internal atau Google |
| 3 | **Daftar genre** lengkap yang disediakan? | 🟡 **Pakai seeder default dulu** |
| 4 | Apakah ada **rating usia** film? (SU, 13+, 17+, 21+) | ⬜ Belum dikonfirmasi |
| 5 | 1 user bisa multiple views untuk film yang sama? | ✅ **1 user = 1 view per film per 24 jam** |
| 6 | Chart views di admin: **per hari, per minggu, atau per bulan**? | ⬜ Belum dikonfirmasi |
| 7 | Apakah admin biasa juga bisa lihat views? | ✅ **Ya, angka saja** — super admin lebih lengkap |
| 8 | Iklan **internal** atau dari **Google Ads**? | ⬜ Belum dikonfirmasi |
| 9 | Bagaimana **mekanisme iklan muncul**? (kapan & di mana) | ⬜ Belum dikonfirmasi |

---

## 8. Catatan Arsitektur yang Perlu Diupdate

### Schema Prisma
- [ ] Tambah field `producer` di tabel `Film`
- [ ] Tambah tabel `Actor` (many-to-many dengan Film)
- [ ] Tambah tabel `Genre` (predefined, many-to-many dengan Film, + seeder)
- [ ] Tambah tabel `FilmView` (tracking views, 1 user 1 view per film per 24 jam)
- [ ] Pertahankan tabel `Ad` (sistem iklan masih ada)

### Endpoint Baru
- [ ] `GET /admin/films/:id/views` — angka views per film (admin + super admin)
- [ ] `GET /admin/stats/views` — chart views semua film (super admin only)
- [ ] `POST /films/:id/view` — catat view (dipanggil dari player frontend)

### Shared Constants
- [ ] `MINIMUM_WATCH_SECONDS = 300` (5 menit = 300 detik)
- [ ] `VIEW_COOLDOWN_HOURS = 24` (1 view per film per 24 jam)
- [ ] Daftar genre predefined (untuk seeder)

