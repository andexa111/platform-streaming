# 📋 Daftar Konfirmasi ke Client — Lalakon

**Tujuan:** Daftar lengkap semua hal yang perlu dikonfirmasi ke client sebelum dan selama development.
**Status:** ⬜ Belum ditanya | 🟡 Sudah ditanya, belum dijawab | ✅ Sudah dikonfirmasi

---

## A. Branding & Identitas

| # | Pertanyaan | Status | Jawaban Client |
|:-:|-----------|:------:|---------------|
| 1 | Logo Lalakon sudah ada? (format PNG/SVG, versi terang & gelap) | ⬜ | |
| 2 | Warna brand utama? (primary color, secondary color) | ⬜ | |
| 3 | Tagline / slogan platform? | ⬜ | |
| 4 | Favicon website sudah ada? | ⬜ | |

---

## B. Domain & Hosting

| # | Pertanyaan | Status | Jawaban Client |
|:-:|-----------|:------:|---------------|
| 5 | Domain `lalakon.id` sudah dibeli? Siapa yang pegang akses DNS? | ⬜ | |
| 6 | Email resmi untuk platform? (misal: `admin@lalakon.id`, `support@lalakon.id`) | ⬜ | |
| 7 | Siapa yang daftarkan akun Midtrans production nanti? (butuh KTP, NPWP, rekening) | ⬜ | |

---

## C. Konten Film

| # | Pertanyaan | Status | Jawaban Client |
|:-:|-----------|:------:|---------------|
| 8 | Apakah ada **rating usia** film? (SU, 13+, 17+, 21+) — Kalau ada, perlu filter di sistem | ✅ | **Tidak ada** rating usia |
| 9 | Daftar **genre** final? Atau pakai default dulu? | ✅ | **Comedy, Horror, Action, Historical, Drama** (5 genre awal) |
| 10 | Berapa jumlah film yang direncanakan saat launch awal? | ✅ | **5-10 film** awal, sisanya admin input sendiri |
| 11 | Format video yang akan diupload? (MP4 saja atau ada format lain?) | ✅ | **MP4 utama**, support format lain (MKV dll) — Bunny auto transcode |
| 12 | Resolusi video? (720p cukup atau harus 1080p/4K?) | ✅ | **720p minimum**, support resolusi lebih tinggi |
| 13 | Film ada **subtitle** / teks terjemahan? | ⬜ | |
| 14 | Trailer film dari mana? (Bunny atau YouTube embed?) | ✅ | **Video khusus dari produser**, upload ke Bunny Storage (`trailers/`) |

---

## D. Subscription & Harga

| # | Pertanyaan | Status | Jawaban Client |
|:-:|-----------|:------:|---------------|
| 15 | **Harga paket bulanan** sudah fix berapa? (default: Rp 49.000) | ✅ | **Rp 49.000** (testing, referensi Netflix) |
| 16 | **Harga paket tahunan** sudah fix berapa? (default: Rp 499.000) | ✅ | **Rp 499.000** (testing, referensi Netflix) |
| 17 | Ada diskon / promo untuk subscriber awal? | ⬜ | |
| 18 | Mau ada **paket free trial** (misal 7 hari gratis)? | ⬜ | |
| 19 | Siapa yang terima uang pembayaran? (rekening bank atas nama siapa?) | ⬜ | |

---

## E. Sistem Iklan

| # | Pertanyaan | Status | Jawaban Client |
|:-:|-----------|:------:|---------------|
| 20 | Iklan dari **internal** (client buat sendiri) atau **Google Ads**? | ⬜ | |
| 21 | Kapan iklan muncul? (sebelum film mulai? di tengah film? saat user gratis kena limit?) | ⬜ | |
| 22 | Berapa lama durasi iklan? (5 detik, 15 detik, 30 detik?) | ⬜ | |
| 23 | Iklan bisa di-skip setelah beberapa detik? Atau wajib ditonton penuh? | ⬜ | |

---

## F. User & Akses

| # | Pertanyaan | Status | Jawaban Client |
|:-:|-----------|:------:|---------------|
| 24 | **1 akun bisa login di berapa device bersamaan?** (1 device saja, 2 device, unlimited?) | ✅ | **Maks 2 device** |
| 25 | User yang belum login (guest) bisa lihat **trailer** atau tidak? | ✅ | Tidak bisa, harus login dulu |
| 26 | User gratis (sudah login, belum subscribe) bisa nonton film preview 20 menit atau hanya trailer? | ⬜ | |
| 27 | Perlu fitur **lupa password / reset password**? | ⬜ | |
| 28 | Login via **Google OAuth** wajib ada atau opsional? | ⬜ | |

---

## G. Admin & CMS

| # | Pertanyaan | Status | Jawaban Client |
|:-:|-----------|:------:|---------------|
| 29 | Berapa **admin** yang akan mengoperasikan CMS? | ⬜ | |
| 30 | Akun admin pertama dibuat manual (seeder) atau via form registrasi khusus? | ⬜ | |
| 31 | Admin perlu fitur **bulk upload** film (banyak sekaligus) atau satu per satu cukup? | ⬜ | |
| 32 | Dashboard admin perlu fitur **export data** ke Excel/CSV? | ⬜ | |

---

## H. Halaman & UI

| # | Pertanyaan | Status | Jawaban Client |
|:-:|-----------|:------:|---------------|
| 33 | Ada referensi desain UI yang disukai? (Netflix, Disney+, Vidio, dll?) | ⬜ | |
| 34 | Mau ada halaman **About Us** / Tentang Kami? | ⬜ | |
| 35 | Mau ada halaman **FAQ** / Pertanyaan Umum? | ⬜ | |
| 36 | Mau ada halaman **Contact Us** / Hubungi Kami? | ⬜ | |
| 37 | Mau ada halaman **Privacy Policy** & **Terms of Service**? (wajib untuk Midtrans production) | ⬜ | |
| 38 | Layout beranda: apakah ada banner/carousel utama di atas? | ⬜ | |

---

## I. Notifikasi

| # | Pertanyaan | Status | Jawaban Client |
|:-:|-----------|:------:|---------------|
| 39 | Email notifikasi pakai bahasa Indonesia atau Inggris? | ⬜ | |
| 40 | Konten email notifikasi perlu disetujui client? (terutama email payment confirmation) | ⬜ | |

---

## J. Teknis & Deployment

| # | Pertanyaan | Status | Jawaban Client |
|:-:|-----------|:------:|---------------|
| 41 | Siapa yang handle **Bunny.net account**? (upload video dilakukan siapa?) | ⬜ | |
| 42 | Deadline / tanggal target **launch**? | ⬜ | |
| 43 | Mau ada **staging environment** (testing dulu sebelum live) atau langsung production? | ⬜ | |
| 44 | Budget bulanan untuk infrastruktur? (VPS + Bunny + Resend + Midtrans fee) | ⬜ | |

---

## Sudah Terkonfirmasi (dari diskusi sebelumnya)

| # | Pertanyaan | Jawaban |
|:-:|-----------|---------|
| - | Nama platform | **Lalakon** |
| - | Domain | **lalakon.id** |
| - | Role sistem | 5 role: Guest, User, Subscriber, Admin, Super Admin |
| - | Guest bisa lihat trailer? | **Tidak**, harus login |
| - | Video disimpan di mana? | **Bunny.net** (admin upload, input link di CMS) |
| - | Payment gateway | **Midtrans** |
| - | Views dihitung setelah? | **5-10 menit** menonton |
| - | 1 user berapa views per film? | **1 view per 24 jam** |
| - | Admin bisa lihat views? | **Ya, angka saja** (chart hanya Super Admin) |
| - | Rating usia film | **Tidak ada** |
| - | Genre awal | **Comedy, Horror, Action, Historical, Drama** |
| - | Jumlah film awal | **5-10 film** |
| - | Format video | **MP4 utama**, support lainnya (Bunny transcode) |
| - | Resolusi video | **720p minimum**, support lebih tinggi |
| - | Trailer | **Video dari produser**, upload ke Bunny Storage |
| - | Harga bulanan (testing) | **Rp 49.000** |
| - | Harga tahunan (testing) | **Rp 499.000** |
| - | Max device bersamaan | **2 device** |

---

> 💡 **Tips:** Copy pertanyaan-pertanyaan di atas ke WhatsApp/chat client. Jawaban mereka akan sangat membantu mempercepat development dan menghindari revisi besar di kemudian hari.
