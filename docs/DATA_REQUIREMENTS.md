# 📦 Data Sistem Lalakon — Struktur Database & Data yang Diperlukan

Dokumen ini menjelaskan data apa saja yang ada di dalam sistem, dari mana asalnya,
dan data apa yang perlu disiapkan dari client.

---

## Ringkasan Tabel Database

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Users     │────▶│ Subscriptions│     │    Films     │
│              │────▶│  Payments    │     │              │
│              │────▶│ EmailTokens  │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                                           ┌──────────────┐
                                           │     Ads      │
                                           └──────────────┘
```

---

## 1. 👤 Tabel `Users` — Data Pengguna

### Sumber data: **Dari user sendiri saat register**
Tidak perlu minta dari client, data terisi otomatis saat user mendaftar.

| Field | Tipe | Contoh | Asal Data |
|-------|------|--------|-----------|
| `name` | String | "Budi Santoso" | User isi saat **register** |
| `email` | String | "budi@gmail.com" | User isi saat **register** |
| `password` | String (hash) | "$2b$12$..." | User isi saat **register**, di-hash bcrypt |
| `role` | Enum | "user" | Otomatis `"user"` saat register, berubah ke `"subscriber"` saat bayar |
| `email_verified_at` | DateTime | "2026-04-01T..." | Otomatis terisi saat user klik link verifikasi |

### ⚠️ Yang perlu dari client:
| Data | Keterangan |
|------|-----------|
| **Email & nama Super Admin pertama** | Untuk bikin akun super admin via seeder |
| **Email & nama Admin** | Daftar admin yang perlu dibuatkan |

### Contoh data seed:
```json
[
  {
    "name": "Super Admin Lalakon",
    "email": "superadmin@lalakon.id",
    "password": "AdminLalakon2026!",
    "role": "superadmin"
  },
  {
    "name": "Admin Content",
    "email": "admin@lalakon.id",
    "password": "AdminContent2026!",
    "role": "admin"
  }
]
```

---

## 2. 🎬 Tabel `Films` — Data Film

### Sumber data: **Dari client / admin** (diinput via admin panel)
Ini data utama yang HARUS diminta dari client.

| Field | Tipe | Contoh | Asal Data |
|-------|------|--------|-----------|
| `title` | String | "Petualangan di Nusantara" | ✅ **Dari client** |
| `description` | Text | "Kisah seorang pemuda yang..." | ✅ **Dari client** |
| `genre` | String | "Drama, Petualangan" | ✅ **Dari client** |
| `duration` | Integer (menit) | 120 | ✅ **Dari client** |
| `release_year` | Integer | 2026 | ✅ **Dari client** |
| `director` | String | "Joko Anwar" | ✅ **Dari client** |
| `poster_url` | String (URL) | "https://lalakon.b-cdn.net/posters/film1.jpg" | Upload oleh admin → URL dari Bunny |
| `trailer_url` | String (URL) | "https://youtube.com/watch?v=xxx" | ✅ **Dari client** (link YouTube) |
| `video_id` | String | "abc123-bunny-id" | Upload oleh admin → ID dari Bunny |
| `is_published` | Boolean | true | Admin set di panel |
| `scheduled_at` | DateTime | "2026-04-15T20:00:00" | ✅ **Dari client** (jadwal tayang) |

### ⚠️ Yang perlu dari client (per film):
```
📁 Untuk setiap film, client harus siapkan:
├── 📄 Judul film
├── 📄 Sinopsis / deskripsi
├── 📄 Genre (bisa lebih dari satu)
├── 📄 Durasi (dalam menit)
├── 📄 Tahun rilis
├── 📄 Nama sutradara
├── 🖼️ File poster (JPG/PNG, resolusi min 600x900px)
├── 🎬 File video film (MP4, resolusi min 720p)
├── 🎬 Link trailer (URL YouTube) atau file trailer
└── 📅 Jadwal tayang (tanggal & jam)
```

### Contoh format data film dari client:
```
Film 1:
- Judul       : Petualangan di Nusantara
- Sinopsis    : Kisah seorang pemuda dari desa kecil yang menjelajahi
                keindahan dan misteri kepulauan Indonesia.
- Genre       : Drama, Petualangan
- Durasi      : 120 menit
- Tahun       : 2026
- Sutradara   : Joko Anwar
- Poster      : [file: poster_nusantara.jpg]
- Video       : [file: film_nusantara.mp4]
- Trailer     : https://youtube.com/watch?v=contoh123
- Jadwal tayang: 15 April 2026, jam 20:00 WIB
```

### Pertanyaan penting untuk client:
1. **Berapa film yang sudah siap** untuk launch awal?
2. **Format video** yang dipakai apa? (MP4 H.264 paling aman)
3. **Resolusi video** minimal berapa? (720p / 1080p / 4K?)
4. **Daftar genre** apa saja yang dipakai? (supaya konsisten)
5. **Jadwal tayang** per minggu atau per bulan?

---

## 3. 💳 Tabel `Subscriptions` — Data Langganan

### Sumber data: **Otomatis dari sistem** saat user bayar
Tidak perlu minta data dari client, terisi otomatis.

| Field | Contoh | Asal Data |
|-------|--------|-----------|
| `userId` | 5 | Dari user yang login |
| `plan` | "monthly" | User pilih di halaman subscribe |
| `status` | "active" | Otomatis `"active"` setelah bayar via webhook |
| `expired_at` | "2026-05-15T..." | Dihitung otomatis: +30 hari (bulanan) / +365 hari (tahunan) |
| `reminder_sent` | false | Diubah cron job saat kirim reminder H-3 |

### ⚠️ Yang perlu dari client:
| Data | Default | Konfirmasi? |
|------|---------|-------------|
| Harga paket **bulanan** | Rp 49.000 | ✅ Perlu konfirmasi |
| Harga paket **tahunan** | Rp 499.000 | ✅ Perlu konfirmasi |
| Apakah ada paket lain? | Tidak | ✅ Perlu konfirmasi |
| Perpanjang = dari `expired_at` lama atau dari `now()`? | Dari `expired_at` lama | ✅ Perlu konfirmasi |

---

## 4. 💰 Tabel `Payments` — Data Pembayaran

### Sumber data: **Otomatis dari Midtrans webhook**
Tidak perlu minta data dari client.

| Field | Contoh | Asal Data |
|-------|--------|-----------|
| `order_id` | "LLK-1712345678-5" | Generate otomatis (prefix + timestamp + userId) |
| `userId` | 5 | Dari user yang login |
| `plan` | "monthly" | Dari paket yang dipilih |
| `amount` | 49000 | Dari config harga |
| `status` | "paid" | Diupdate dari webhook Midtrans |

### ⚠️ Yang perlu dari client:
| Data | Keterangan |
|------|-----------|
| **Prefix order ID** | Mau pakai apa? Saran: `LLK` (Lalakon) |
| **Metode pembayaran** | Transfer bank, e-wallet (GoPay, OVO, Dana), kartu kredit? |
| **Rekening penerima** | Untuk settlement Midtrans |

---

## 5. 📺 Tabel `Ads` — Data Iklan

### Sumber data: **Dari client / admin** (diinput via admin panel)

| Field | Tipe | Contoh | Asal Data |
|-------|------|--------|-----------|
| `title` | String | "Promo Ramadan 2026" | ✅ **Dari client** |
| `duration` | Integer (detik) | 30 | ✅ **Dari client** |
| `video_url` | String (URL) | "https://lalakon.b-cdn.net/ads/promo.mp4" | Upload oleh admin |
| `is_active` | Boolean | true | Admin set (hanya 1 aktif) |

### ⚠️ Yang perlu dari client:
```
📁 Untuk setiap iklan, client harus siapkan:
├── 📄 Judul / nama iklan
├── 🎬 File video iklan (MP4, durasi 15-60 detik ideal)
└── 📄 Durasi (dalam detik)
```

### Pertanyaan untuk client:
1. **Sudah ada video iklan** untuk launch awal?
2. **Iklan dari pihak ketiga** (sponsor) atau iklan internal (promo Lalakon)?
3. **Durasi ideal iklan** berapa detik? (15s / 30s / 60s?)

---

## 6. 📧 Tabel `EmailTokens` — Token Verifikasi

### Sumber data: **Otomatis dari sistem**
Tidak ada data dari client. Token di-generate saat register dan dihapus setelah verifikasi.

---

## Ringkasan: Data yang Harus Minta dari Client

### 🔴 WAJIB ada sebelum development
| # | Data | Untuk |
|---|------|-------|
| 1 | Harga paket bulanan & tahunan | Config subscription |
| 2 | Email & password Super Admin | Seeder database |
| 3 | Daftar genre film | Validasi & filter |

### 🟡 WAJIB ada sebelum testing (Minggu 3-5)
| # | Data | Untuk |
|---|------|-------|
| 4 | Minimal 2-3 film lengkap (metadata + poster + video) | Testing streaming |
| 5 | Minimal 1 video iklan | Testing sistem iklan |
| 6 | Prefix order ID pembayaran | Format payment |
| 7 | Metode pembayaran yang diaktifkan | Config Midtrans |

### 🟢 BISA menyusul (sebelum deploy)
| # | Data | Untuk |
|---|------|-------|
| 8 | Logo Lalakon (PNG/SVG) | Branding |
| 9 | Wording template email | Email notifikasi |
| 10 | Daftar film lengkap untuk launch | Konten |

---

## Template Formulir untuk Client

Kirimkan formulir ini ke client untuk diisi:

```
=== FORMULIR DATA LALAKON ===

1. HARGA LANGGANAN
   - Paket bulanan : Rp ________
   - Paket tahunan : Rp ________

2. AKUN ADMIN
   - Super Admin
     Nama  : _______________
     Email : _______________
   - Admin 1
     Nama  : _______________
     Email : _______________

3. DAFTAR GENRE FILM
   (centang yang dipakai)
   [ ] Drama     [ ] Komedi      [ ] Aksi
   [ ] Horror    [ ] Romantis    [ ] Thriller
   [ ] Animasi   [ ] Dokumenter  [ ] Petualangan
   [ ] Lainnya: _______________

4. DATA FILM (isi per film)
   - Judul        : _______________
   - Sinopsis     : _______________
   - Genre        : _______________
   - Durasi       : ___ menit
   - Tahun        : ___
   - Sutradara    : _______________
   - Trailer URL  : _______________
   - Jadwal tayang: _______________
   - File poster  : [lampirkan]
   - File video   : [lampirkan / kirim via drive]

5. IKLAN
   - Judul iklan  : _______________
   - Durasi       : ___ detik
   - File video   : [lampirkan]

6. PEMBAYARAN
   - Prefix order ID : ___ (saran: LLK)
   - Metode bayar    : [ ] Transfer bank  [ ] E-wallet  [ ] Kartu kredit

7. BRANDING
   - Logo         : [lampirkan]
   - Warna utama  : #______
   - Tagline      : _______________
```
