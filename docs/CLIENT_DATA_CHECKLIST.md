# 📋 Checklist Data dari Client — Backend

Daftar data/informasi yang perlu diminta dari client sebelum dan selama development backend **Lalakon**.

---

## 1. 🔑 Akun & Kredensial Layanan Eksternal

### Bunny.net (Video CDN & Storage) — Minggu 3
| Data | Keterangan | Status |
|------|-----------|--------|
| Akun Bunny.net | Siapa yang daftar? Client atau kita? | ⬜ |
| API Key | Dari dashboard Bunny.net | ⬜ |
| Storage Zone Name | Nama zone untuk simpan file video, poster, iklan | ⬜ |
| Storage Zone Region | Pilih region terdekat (sg = Singapore) | ⬜ |
| Pull Zone / CDN URL | URL publik untuk akses file (misal: `lalakon.b-cdn.net`) | ⬜ |
| Token Authentication Key | Secret key untuk generate Signed URL | ⬜ |

> 💡 **Pertanyaan ke client:** Apakah client sudah punya akun Bunny.net? Atau kita yang buatkan? Budget bulanan berapa?

---

### Midtrans (Payment Gateway) — Minggu 5
| Data | Keterangan | Status |
|------|-----------|--------|
| Akun Midtrans Sandbox | Untuk development & testing | ⬜ |
| Server Key (Sandbox) | Dari dashboard Midtrans Sandbox | ⬜ |
| Client Key (Sandbox) | Untuk frontend redirect | ⬜ |
| Akun Midtrans Production | Untuk go-live nanti | ⬜ |
| Server Key (Production) | Dari dashboard Midtrans Production | ⬜ |
| Client Key (Production) | Untuk frontend redirect | ⬜ |
| Metode Pembayaran | Transfer bank? E-wallet? Kartu kredit? Semua? | ⬜ |

> 💡 **Pertanyaan ke client:** Midtrans butuh verifikasi bisnis (KTP, NPWP, akta perusahaan) untuk akun Production. Sudah siap?

---

### Resend (Email Service) — Minggu 2
| Data | Keterangan | Status |
|------|-----------|--------|
| Akun Resend | Siapa yang daftar? | ⬜ |
| API Key | Dari dashboard Resend | ⬜ |
| Domain pengirim | Email dikirim dari mana? (misal: `noreply@lalakon.id`) | ⬜ |
| Verifikasi domain DNS | Perlu setting DNS record di domain lalakon.id | ⬜ |

> 💡 **Pertanyaan ke client:** Sudah punya akses ke DNS management domain `lalakon.id`?

---

## 2. 💰 Data Bisnis & Harga

### Paket Subscription
| Data | Keterangan | Contoh | Status |
|------|-----------|--------|--------|
| Nama paket bulanan | Label yang ditampilkan | "Bulanan" | ⬜ |
| Harga bulanan | Dalam Rupiah | Rp 49.000 | ⬜ |
| Nama paket tahunan | Label yang ditampilkan | "Tahunan" | ⬜ |
| Harga tahunan | Dalam Rupiah | Rp 499.000 | ⬜ |
| Benefit tiap paket | Apa saja yang didapat subscriber? | Nonton full, tanpa iklan | ⬜ |
| Free trial? | Apakah ada masa percobaan gratis? | Tidak | ⬜ |
| Promo/diskon? | Apakah ada kode promo? | Belum | ⬜ |

### Aturan Streaming
| Data | Keterangan | Default | Status |
|------|-----------|---------|--------|
| Batas nonton gratis | Berapa menit sebelum iklan? | 20 menit | ⬜ |
| Durasi signed URL subscriber | Berapa jam URL valid? | 2 jam | ⬜ |
| Durasi signed URL gratis | Berapa menit URL valid? | 25 menit | ⬜ |
| Jumlah iklan aktif | Berapa iklan bisa aktif sekaligus? | 1 saja | ⬜ |

---

## 3. 🎬 Data Konten Awal

| Data | Keterangan | Status |
|------|-----------|--------|
| Film pertama | Minimal 1-2 film untuk testing | ⬜ |
| Poster film | File JPG/PNG (rasio 2:3 disarankan) | ⬜ |
| Video film | File MP4 (akan diupload ke Bunny) | ⬜ |
| Trailer film | URL YouTube/embed atau file video | ⬜ |
| Metadata film | Judul, genre, sinopsis, durasi, sutradara, tahun | ⬜ |
| Video iklan | 1 file video iklan untuk testing (MP4) | ⬜ |

> 💡 Untuk development, bisa pakai video sample dulu. Konten asli bisa ditambahkan nanti.

---

## 4. 🌐 Domain & Infrastruktur

| Data | Keterangan | Status |
|------|-----------|--------|
| Domain | `lalakon.id` — sudah dibeli? | ⬜ |
| Akses DNS management | Untuk pointing domain & verifikasi email | ⬜ |
| VPS/Hosting | Pakai apa? (DigitalOcean, AWS, dll.) | ⬜ |
| Spesifikasi VPS | Min: 2 vCPU, 4GB RAM, 100GB SSD | ⬜ |
| SSL Certificate | Gratis via Let's Encrypt atau beli? | ⬜ |
| MySQL server | Di VPS yang sama atau managed? | ⬜ |

> 💡 **Pertanyaan ke client:** Budget hosting bulanan berapa? Ini menentukan pilihan VPS.

---

## 5. 👤 Data Akun & Role

| Data | Keterangan | Status |
|------|-----------|--------|
| Akun Super Admin | Email & nama super admin pertama | ⬜ |
| Akun Admin | Daftar admin yang perlu dibuat | ⬜ |
| Google OAuth Client ID | Jika pakai login Google, perlu daftar di Google Cloud Console | ⬜ |
| Google OAuth Client Secret | Dari Google Cloud Console | ⬜ |

> 💡 **Pertanyaan ke client:** Login Google pakai akun Google Cloud siapa? Client atau kita?

---

## 6. 📧 Template Email

Minta konfirmasi wording/konten email berikut:

| Email | Isi | Status |
|-------|-----|--------|
| Verifikasi email | "Halo {nama}, klik link ini untuk verifikasi..." | ⬜ |
| Konfirmasi pembayaran | "Terima kasih {nama}, langganan aktif sampai..." | ⬜ |
| Reminder H-3 | "Langganan kamu akan berakhir dalam 3 hari..." | ⬜ |
| Notif expired | "Langganan kamu sudah berakhir, perpanjang di..." | ⬜ |
| Notif film baru | "Film baru telah tersedia: {judul film}..." | ⬜ |

> 💡 Kita bisa buatkan draft template-nya dulu, lalu client review wording-nya.

---

## 7. 🎨 Branding (untuk email & SEO)

| Data | Keterangan | Status |
|------|-----------|--------|
| Logo Lalakon | File PNG/SVG (untuk email header & favicon) | ⬜ |
| Warna brand | Primary color, accent color | ⬜ |
| Tagline | "Nonton film favorit kapan saja" atau lainnya? | ⬜ |
| Deskripsi SEO | Teks untuk meta description website | ⬜ |

---

## Prioritas: Data Mana Dulu?

| Minggu | Data yang Dibutuhkan |
|--------|---------------------|
| **Minggu 2** (Auth) | Akun Resend + API Key, domain email, Google OAuth (opsional) |
| **Minggu 3** (Film) | Akun Bunny.net + semua key, 1-2 film sample |
| **Minggu 5** (Payment) | Akun Midtrans Sandbox + key, harga paket final |
| **Sebelum Deploy** | Domain, VPS, akun Production Midtrans, SSL |

---

> 📝 **Tips:** Tidak perlu minta semua sekaligus. Minta sesuai timeline minggu saat ini.
> Untuk development awal (Minggu 1-2), cukup siapkan **MySQL lokal** dan **akun Resend** saja.
