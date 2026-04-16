# 🐰 Panduan Setup Bunny.net untuk Lalakon

**Tujuan:** Setup Bunny.net dengan biaya seefisien mungkin untuk platform streaming Lalakon.

---

## Ringkasan: Apa yang Perlu & Tidak Perlu

| Fitur Bunny | Butuh? | Keterangan |
|-------------|:------:|-----------|
| **Stream** | ✅ **YA** | Untuk hosting & streaming video film |
| **Storage** | ✅ **YA** | Untuk menyimpan poster, trailer, video iklan |
| **CDN (Pull Zone)** | ✅ **YA** | Otomatis dibuat saat buat Storage Zone |
| **DNS** | ❌ TIDAK | Pakai DNS dari registrar domain (Cloudflare/Niagahoster/dll) |
| **Purge** | ❌ TIDAK | Hanya perlu jika ada masalah cache |
| **Magic Container** | ❌ TIDAK | Untuk deploy container — kita sudah pakai VPS sendiri |
| **Scripting** | ❌ TIDAK | Edge functions — tidak dibutuhkan |
| **Database** | ❌ TIDAK | Edge database — kita sudah pakai MySQL sendiri |

> 💡 **Intinya: Kamu hanya perlu setup 2 hal → Stream + Storage**

---

## BAGIAN 1: Bunny Stream (Untuk Video Film)

### Kenapa pakai Stream, bukan Storage biasa?
- **Stream** = fitur khusus video. Otomatis transcoding ke berbagai resolusi (360p, 720p, 1080p)
- **Stream** = sudah ada video player embed bawaan
- **Stream** = HLS adaptive streaming (auto-adjust kualitas sesuai internet user)
- **Stream** = support token authentication (Signed URL) untuk proteksi video

Kalau simpan video di **Storage biasa**, kamu harus handle transcoding sendiri — ribet dan mahal.

### Cara Setup Stream

#### Langkah 1: Buat Stream Library
1. Login ke dashboard Bunny → klik **Stream** di sidebar
2. Klik **Add Video Library**
3. Isi:
   - **Library Name:** `lalakon-films`
   - **Main Storage Region:** pilih **Asia (Singapore)** ← terdekat dari Indonesia
   - **Pricing Standard vs Volume:** pilih **Standard** dulu (hemat untuk awal)
4. Klik **Create**

#### Langkah 2: Aktifkan Token Authentication (PENTING!)
1. Masuk ke library `lalakon-films`
2. Klik **Security** di sub-menu
3. Aktifkan: **Enable Token Authentication**
4. Salin **Token Authentication Key** → simpan di `.env` sebagai `BUNNY_TOKEN_SECURITY_KEY`
5. Setting:
   - **Allowed Referrers:** kosongkan dulu (isi domain `lalakon.id` saat production)
   - **Block Direct URL Access:** ✅ aktifkan — supaya URL tidak bisa dibuka langsung tanpa token
   - **Enable MP4 Fallback:** ❌ matikan — kita mau pakai HLS streaming saja
6. Klik **Save**

#### Langkah 3: Catat Credentials
Dari halaman library, catat nilai berikut untuk `.env`:

```env
BUNNY_STREAM_LIBRARY_ID=12345           # dari URL: stream.bunnycdn.com/library/12345
BUNNY_STREAM_API_KEY=xxxx-xxxx-xxxx     # di tab API
BUNNY_TOKEN_SECURITY_KEY=xxxxx          # di tab Security
```

#### Langkah 4: Upload Video (Test)
1. Di library, klik **Upload** → drag & drop file MP4
2. Tunggu transcoding selesai (progress bar hijau)
3. Klik video → copy **Video ID** (misal: `a1b2c3d4-e5f6-...`)
4. Video ID inilah yang admin input di CMS nanti

### Estimasi Biaya Stream

| Komponen | Harga | Contoh |
|----------|-------|--------|
| Storage | $0.01/GB | 50 film × 2GB = 100GB → **$1.00/bulan** |
| Bandwidth | $0.005/GB | 100 user × 3GB/bulan = 300GB → **$1.50/bulan** |
| Transcoding | Gratis | Sudah termasuk |

> 📊 **Estimasi awal: ~$2.50/bulan** (~Rp 40.000) untuk 50 film dan 100 user aktif

---

## BAGIAN 2: Bunny Storage (Untuk Poster, Trailer, Iklan)

### Kenapa pakai Storage terpisah?
File non-video (poster, thumbnail, video iklan pendek) tidak perlu transcoding. Simpan di **Storage Zone** biasa lebih murah.

### Cara Setup Storage

#### Langkah 1: Buat Storage Zone
1. Dashboard Bunny → klik **Storage** di sidebar
2. Klik **Add Storage Zone**
3. Isi:
   - **Name:** `lalakon-assets`
   - **Main Region:** **Asia Pacific (Singapore)** ← SG terdekat dari Indonesia
   - **Replication Regions:** ❌ **jangan centang region lain** (hemat biaya, 1 region cukup untuk awal)
   - **Storage Tier:** pilih **Standard (HDD)** ← lebih murah, poster/iklan tidak perlu SSD
4. Klik **Create**

#### Langkah 2: Buat Folder Struktur
Di Storage Zone `lalakon-assets`, buat folder:
```
lalakon-assets/
├── posters/        ← poster film (JPG/PNG)
├── trailers/       ← video trailer pendek (MP4)
├── ads/            ← video iklan (MP4)
└── thumbnails/     ← thumbnail film (opsional)
```

#### Langkah 3: Hubungkan Pull Zone (CDN)
1. Saat buat Storage Zone, Bunny secara otomatis tawarin bikin **Pull Zone**
2. Klik **Add Pull Zone** → beri nama: `lalakon-cdn`
3. Ini akan menghasilkan URL seperti: `https://lalakon-cdn.b-cdn.net`
4. Setting Pull Zone:
   - **Security** → aktifkan **Block Root Path Access** (opsional)
   - **Caching** → biarkan default (cache 30 hari, sudah optimal untuk file statis)
   - **Custom Hostname:** isi `cdn.lalakon.id` (opsional, untuk branding URL)

#### Langkah 4: Catat Credentials

```env
BUNNY_STORAGE_ZONE=lalakon-assets
BUNNY_STORAGE_API_KEY=xxxx-xxxx-xxxx     # di halaman Storage Zone → FTP & API Access
BUNNY_CDN_URL=https://lalakon-cdn.b-cdn.net
```

### Estimasi Biaya Storage

| Komponen | Harga | Contoh |
|----------|-------|--------|
| Storage (SG) | $0.01/GB | 50 poster (5MB each) + 10 iklan (50MB each) = 750MB → **$0.01/bulan** |
| Bandwidth (Asia) | $0.03/GB | 1000 load poster/bulan × 5MB = 5GB → **$0.15/bulan** |

> 📊 **Estimasi: ~$0.16/bulan** (~Rp 2.500) — sangat murah!

---

## BAGIAN 3: Yang TIDAK Perlu Disetup

### ❌ DNS
- Kamu sudah punya domain `lalakon.id`
- Kelola DNS di registrar domain kamu (Niagahoster, Namecheap, Cloudflare, dll)
- Bunny DNS hanya perlu kalau mau mindahin semua DNS management ke Bunny — tidak perlu

### ❌ Purge
- Fitur untuk menghapus cache CDN secara manual
- Hanya perlu kalau ada masalah (misal poster diupdate tapi masih tampil yang lama)
- Tidak perlu setup apapun, tinggal klik tombol saat dibutuhkan

### ❌ Magic Container
- Fitur untuk deploy Docker container di edge Bunny
- Kamu sudah pakai VPS sendiri untuk NestJS + Next.js
- **JANGAN pakai** — ini akan menambah biaya tidak perlu

### ❌ Scripting
- Edge functions (seperti Cloudflare Workers)
- Tidak dibutuhkan, semua logika sudah di NestJS backend
- **JANGAN pakai**

### ❌ Database
- Edge key-value database
- Kamu sudah pakai MySQL + Prisma
- **JANGAN pakai**

---

## BAGIAN 4: Ringkasan Biaya Total

### Skenario: 50 Film, 100 User Aktif/Bulan

| Layanan | Item | Biaya/Bulan |
|---------|------|-------------|
| **Stream** | Storage 100GB | $1.00 |
| **Stream** | Bandwidth 300GB | $1.50 |
| **Storage** | Assets 1GB | $0.01 |
| **CDN** | Bandwidth 5GB | $0.15 |
| **Minimum** | Platform fee | $1.00 |
| | **TOTAL** | **~$2.66/bulan** |
| | | **~Rp 42.000/bulan** |

### Skenario: 100 Film, 500 User Aktif/Bulan

| Layanan | Item | Biaya/Bulan |
|---------|------|-------------|
| **Stream** | Storage 200GB | $2.00 |
| **Stream** | Bandwidth 1.5TB | $7.50 |
| **Storage** | Assets 2GB | $0.02 |
| **CDN** | Bandwidth 10GB | $0.30 |
| | **TOTAL** | **~$9.82/bulan** |
| | | **~Rp 155.000/bulan** |

### Skenario: 100 Film, 2000 User Aktif/Bulan

| Layanan | Item | Biaya/Bulan |
|---------|------|-------------|
| **Stream** | Storage 200GB | $2.00 |
| **Stream** | Bandwidth 6TB | $30.00 |
| **Storage** | Assets 2GB | $0.02 |
| **CDN** | Bandwidth 30GB | $0.90 |
| | **TOTAL** | **~$32.92/bulan** |
| | | **~Rp 520.000/bulan** |

> 💡 Biaya terbesar dari Bunny adalah **bandwidth streaming** — makin banyak user nonton, makin mahal.
> Tapi dibandingkan AWS/GCP, Bunny **JAUH lebih murah** (AWS CloudFront: $0.085/GB vs Bunny Stream: $0.005/GB).

---

## BAGIAN 5: Setting di File .env

Setelah semua disetup, berikut nilai yang perlu diisi di `.env`:

```env
# ===== BUNNY STREAM (Video Film) =====
BUNNY_STREAM_LIBRARY_ID=12345
BUNNY_STREAM_API_KEY=xxxx-xxxx-xxxx-xxxx
BUNNY_TOKEN_SECURITY_KEY=your-token-auth-key

# ===== BUNNY STORAGE (Poster, Iklan, dll) =====
BUNNY_STORAGE_ZONE=lalakon-assets
BUNNY_STORAGE_API_KEY=xxxx-xxxx-xxxx-xxxx
BUNNY_STORAGE_REGION=sg         # Singapore

# ===== BUNNY CDN =====
BUNNY_CDN_URL=https://lalakon-cdn.b-cdn.net
BUNNY_STREAM_CDN_URL=https://vz-xxxx.b-cdn.net  # dari Stream library
```

---

## BAGIAN 6: Checklist Setup

### ✅ Bunny Stream (Video Film)
- [ ] Buat Stream Library: `lalakon-films` (region: Singapore)
- [ ] Aktifkan Token Authentication
- [ ] Aktifkan Block Direct URL Access
- [ ] Salin Library ID, API Key, Token Key ke `.env`
- [ ] Test upload 1 video & pastikan bisa diplay

### ✅ Bunny Storage (Assets)
- [ ] Buat Storage Zone: `lalakon-assets` (region: SG, Standard HDD)
- [ ] Buat folder: `posters/`, `trailers/`, `ads/`, `thumbnails/`
- [ ] Buat Pull Zone: `lalakon-cdn`
- [ ] Salin Storage Zone name, API Key, CDN URL ke `.env`
- [ ] Test upload 1 gambar & akses via CDN URL

### ❌ Jangan Setup
- [ ] DNS — pakai DNS registrar domain
- [ ] Magic Container — pakai VPS sendiri
- [ ] Scripting — tidak dibutuhkan
- [ ] Database — pakai MySQL sendiri

---

## Tips Hemat Budget

1. **Mulai 1 region saja** (Singapore) — jangan tambah replication region
2. **Pakai Standard HDD** untuk Storage — SSD tidak perlu untuk poster/iklan
3. **Monitor bandwidth** di dashboard Bunny — ini biaya utama
4. **Compress video** sebelum upload — 720p sudah cukup untuk mayoritas user Indonesia
5. **Jangan aktifkan fitur yang tidak dipakai** — setiap fitur = potensi biaya
6. **Set billing alert** di Bunny dashboard — misal alert di $10/bulan
