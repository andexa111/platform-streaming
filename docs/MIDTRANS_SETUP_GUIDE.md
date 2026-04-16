# 💳 Panduan Setup Midtrans untuk Lalakon

**Tujuan:** Setup Midtrans untuk menerima pembayaran subscription bulanan & tahunan.

---

## Ringkasan: Apa yang Perlu & Tidak Perlu

| Fitur Midtrans | Butuh? | Keterangan |
|---------------|:------:|-----------|
| **Snap (Payment Popup)** | ✅ **YA** | Tampilan pembayaran otomatis dari Midtrans |
| **Server Key & Client Key** | ✅ **YA** | Kredensial untuk integrasi API |
| **Webhook (Notification URL)** | ✅ **YA** | Notifikasi otomatis saat user selesai bayar |
| **Core API** | ❌ TIDAK | Terlalu kompleks — Snap sudah cukup |
| **Recurring Payment** | ❌ TIDAK | Kita handle perpanjangan manual (bukan auto-debit) |
| **Subscription API** | ❌ TIDAK | Kita buat sistem subscription sendiri |
| **PayOut** | ❌ TIDAK | Untuk disbursement — tidak dibutuhkan |
| **Iris** | ❌ TIDAK | Untuk payout ke banyak rekening — tidak dibutuhkan |

> 💡 **Intinya: Pakai Snap saja. Simpel, tampilannya bagus, handle semua metode bayar.**

---

## Snap vs Core API — Kenapa Pilih Snap?

| Aspek | Snap ✅ | Core API ❌ |
|-------|---------|-----------|
| Kompleksitas | Mudah — 1 endpoint saja | Kompleks — harus handle setiap metode bayar |
| Tampilan | Popup cantik dari Midtrans | Harus buat UI pembayaran sendiri |
| Metode bayar | Otomatis semua (bank, ewallet, CC) | Harus setup satu per satu |
| Keamanan | Midtrans handle semua | Harus handle sendiri |
| Cocok untuk | Startup, MVP, small-medium | Enterprise yang butuh full custom |

> **Snap = Popup pembayaran otomatis dari Midtrans.** User klik bayar → muncul popup → pilih metode → bayar → selesai.

---

## BAGIAN 1: Setup Sandbox (Development)

### LANGKAH 1: Daftar Akun Midtrans

1. Buka **https://dashboard.midtrans.com/register**
2. Isi formulir:
   - **Email:** email kamu
   - **Password:** buat password
3. Verifikasi email
4. Login ke dashboard

> ⚠️ Setelah daftar, kamu masuk ke mode **Sandbox** secara otomatis. Ini mode testing — tidak ada uang nyata.

### LANGKAH 2: Ambil Credentials (Sandbox)

1. Login ke **https://dashboard.sandbox.midtrans.com**
2. Pastikan di pojok kiri atas tertulis **"Sandbox"** (bukan Production)
3. Klik **Settings** → **Access Keys**
4. Salin:

```env
# ===== MIDTRANS SANDBOX =====
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
```

| Key | Kegunaan | Simpan di mana? |
|-----|----------|----------------|
| **Server Key** | Untuk API call dari backend (buat order, verifikasi webhook) | `.env` backend (RAHASIA!) |
| **Client Key** | Untuk load Snap popup di frontend | `.env` frontend (boleh publik) |

> ⚠️ **Server Key JANGAN PERNAH expose di frontend!** Hanya dipakai di backend.

### LANGKAH 3: Setup Webhook (Notification URL)

Ini **PALING PENTING** — tanpa webhook, pembayaran user tidak akan memicu aktivasi subscription.

1. Dashboard Sandbox → **Settings** → **Configuration**
2. Scroll ke bagian **Notification URL**
3. Isi dengan URL backend kamu:

**Untuk development (lokal):**
```
https://xxxx.ngrok.io/webhooks/midtrans
```
> Butuh **ngrok** untuk expose localhost ke internet (Midtrans tidak bisa kirim webhook ke localhost)

**Untuk production nanti:**
```
https://api.lalakon.id/webhooks/midtrans
```

4. Klik **Save**

### LANGKAH 4: Aktifkan Metode Pembayaran (Sandbox)

1. Dashboard → **Settings** → **Payment Methods** (atau **Snap Preferences**)
2. Aktifkan metode yang dibutuhkan:

| Metode | Aktifkan? | Keterangan |
|--------|:---------:|-----------|
| **Bank Transfer (VA)** | ✅ YA | BCA, BNI, BRI, Mandiri, Permata — paling populer di Indonesia |
| **E-Wallet** | ✅ YA | GoPay, ShopeePay, DANA — banyak dipakai anak muda |
| **QRIS** | ✅ YA | Scan QR — universal untuk semua ewallet |
| **Credit Card** | 🟡 Opsional | Visa, MasterCard — biasanya untuk user premium |
| **Convenience Store** | ❌ TIDAK | Alfamart, Indomaret — ribet untuk subscription |
| **Akulaku** | ❌ TIDAK | Cicilan — tidak cocok untuk subscription bulanan |
| **Kredivo** | ❌ TIDAK | Cicilan — tidak cocok untuk subscription |

> 💡 **Rekomendasi awal:** Bank Transfer VA + GoPay + ShopeePay + QRIS sudah cukup cover 90% user Indonesia.

### LANGKAH 5: Test Pembayaran (Sandbox)

#### Cara test:
1. Dari backend, buat order ke Midtrans (akan kita code nanti)
2. Midtrans return **Snap Token** + **Redirect URL**
3. Buka redirect URL → muncul halaman pembayaran Midtrans
4. Pilih metode bayar → gunakan **data dummy** dari Midtrans

#### Data Testing Sandbox:

**Bank Transfer (VA):**
- Gunakan simulator di dashboard → **Settings** → **Sandbox Simulator**
- Atau langsung approve dari dashboard

**GoPay:**
- Simulator QR code muncul otomatis
- Klik **Simulate Payment** di sandbox

**Credit Card (test):**
```
Card Number: 4811 1111 1111 1114
CVV: 123
Exp: 01/29 (bulan/tahun di masa depan)
OTP: 112233
```

---

## BAGIAN 2: Flow Pembayaran di Lalakon

```
User klik "Berlangganan"
        │
        ▼
Frontend → POST /subscriptions/create (kirim plan: monthly/yearly)
        │
        ▼
Backend:
  1. Buat order_id unik: LLK-{timestamp}-{userId}
  2. Simpan ke tabel Payments (status: pending)
  3. Kirim request ke Midtrans Snap API
  4. Dapat snap_token + redirect_url
  5. Return ke frontend
        │
        ▼
Frontend → Redirect user ke halaman Midtrans
        │
        ▼
User bayar di halaman Midtrans (pilih metode, transfer/scan)
        │
        ▼
Midtrans kirim WEBHOOK ke backend: POST /webhooks/midtrans
        │
        ▼
Backend (webhook handler):
  1. Verifikasi SHA512 signature (keamanan!)
  2. Cek idempotency (sudah pernah diproses?)
  3. DB Transaction:
     - Update payments.status → "paid"
     - Update/create subscriptions.status → "active"
     - Update users.role → "subscriber"
  4. Kirim email konfirmasi via Resend
        │
        ▼
User sekarang adalah Subscriber ✅
```

---

## BAGIAN 3: Yang TIDAK Perlu Disetup

### ❌ Core API
- Untuk membuat UI pembayaran sendiri (tanpa popup Midtrans)
- Terlalu kompleks, harus handle setiap metode bayar individual
- **Snap sudah lebih dari cukup**

### ❌ Recurring Payment / Subscription API
- Fitur Midtrans untuk auto-debit otomatis setiap bulan
- Butuh kartu kredit + consent user → ribet
- Kita handle sendiri: user bayar manual setiap bulan/tahun
- **SKIP**

### ❌ PayOut / Iris
- Untuk transfer uang KELUAR (disbursement ke rekening lain)
- Lalakon hanya MENERIMA pembayaran, bukan membayar
- **SKIP**

### ❌ Payment Link
- Untuk buat link pembayaran tanpa coding
- Kita sudah buat sistem sendiri via API
- **SKIP**

---

## BAGIAN 4: Biaya & Fee Midtrans

### Fee per Transaksi (Production)

| Metode | Fee | Contoh (Rp 49.000) |
|--------|-----|:-------------------:|
| **Bank Transfer VA** | Rp 4.000 flat | Rp 4.000 |
| **GoPay** | 2% | Rp 980 |
| **ShopeePay** | 2% | Rp 980 |
| **QRIS** | 0.7% | Rp 343 |
| **Credit Card** | 2.9% + Rp 2.000 | Rp 3.421 |

> 💡 **QRIS paling murah!** Pertimbangkan untuk highlight QRIS di halaman pembayaran.

### Biaya Tetap
- **Setup fee:** Rp 0 (gratis)
- **Monthly fee:** Rp 0 (gratis)
- **Sandbox:** Gratis sepenuhnya, tidak ada biaya

### Siapa yang Bayar Fee?
- Default: **merchant** (Lalakon) yang bayar fee
- Bisa juga dibebankan ke user (tambahkan fee ke harga) — tapi tidak disarankan

### Settlement (Dana Masuk)
- Bank Transfer: **H+1** (1 hari kerja)
- E-Wallet: **H+1**
- Credit Card: **H+2** sampai **H+3**

---

## BAGIAN 5: Dari Sandbox ke Production

### Syarat Production (nanti kalau mau go-live):

| Dokumen | Keterangan |
|---------|-----------|
| **KTP** | Pemilik bisnis / penanggung jawab |
| **NPWP** | Bisa NPWP pribadi atau badan |
| **Akta Perusahaan** | Kalau badan usaha (PT/CV) |
| **Rekening Bank** | Untuk settlement (dana masuk) |
| **Website Live** | Midtrans akan cek website kamu |
| **Kebijakan Privasi** | Halaman privacy policy di website |
| **Syarat & Ketentuan** | Halaman terms of service di website |

> ⚠️ **Ini TIDAK perlu sekarang.** Lakukan saat mendekati launch. Proses approval sekitar 3-5 hari kerja.

### Cara Switch ke Production:
1. Submit dokumen di dashboard Midtrans
2. Tunggu approval (3-5 hari kerja)
3. Ambil **Production Server Key** & **Client Key** dari dashboard Production
4. Update `.env`:

```env
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxx       # tanpa SB- prefix
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxx       # tanpa SB- prefix
MIDTRANS_IS_PRODUCTION=true                        # ubah ke true
```

5. Update Notification URL ke URL production
6. Test lagi dengan nominal kecil (Rp 1.000)

---

## Setting di File .env (Lengkap)

```env
# ===== MIDTRANS =====
# Sandbox (Development)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# Production (Go-Live) — ganti nanti
# MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxx
# MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxx
# MIDTRANS_IS_PRODUCTION=true

# Webhook (untuk ngrok saat development)
MIDTRANS_WEBHOOK_URL=https://xxxx.ngrok.io/webhooks/midtrans
```

---

## Checklist Setup Midtrans

### Sandbox (Sekarang — Minggu 5)
- [ ] Daftar akun di midtrans.com
- [ ] Ambil Sandbox Server Key & Client Key
- [ ] Simpan ke `.env`
- [ ] Aktifkan metode: Bank Transfer VA, GoPay, ShopeePay, QRIS
- [ ] Install ngrok untuk testing webhook lokal
- [ ] Set Notification URL di dashboard
- [ ] Test pembayaran dengan Sandbox Simulator
- [ ] Verifikasi webhook diterima di backend

### Production (Nanti — sebelum launch)
- [ ] Submit dokumen verifikasi (KTP, NPWP, dll)
- [ ] Tunggu approval (3-5 hari)
- [ ] Ambil Production Server Key & Client Key
- [ ] Update `.env` ke production
- [ ] Update Notification URL ke domain production
- [ ] Buat halaman Privacy Policy & Terms of Service
- [ ] Test pembayaran production dengan nominal kecil
