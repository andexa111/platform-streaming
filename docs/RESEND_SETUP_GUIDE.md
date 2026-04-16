# 📧 Panduan Setup Resend untuk Lalakon

**Tujuan:** Setup Resend untuk mengirim email transaksional (verifikasi, notifikasi, reminder).

---

## Ringkasan: Apa yang Perlu & Tidak Perlu

| Fitur Resend | Butuh? | Keterangan |
|-------------|:------:|-----------|
| **API Key** | ✅ **YA** | Untuk kirim email dari backend |
| **Domain Verification** | ✅ **YA** | Supaya email dikirim dari `@lalakon.id` |
| **Webhooks** | ❌ TIDAK | Kita tidak perlu tracking delivery/open rate |
| **Audiences** | ❌ TIDAK | Fitur newsletter/broadcast — tidak dibutuhkan |
| **Contacts** | ❌ TIDAK | CRM — tidak dibutuhkan |
| **Broadcast** | ❌ TIDAK | Mass email — tidak dibutuhkan |

> 💡 **Intinya: Cukup buat API Key + verifikasi domain**

---

## LANGKAH 1: Daftar Akun Resend

1. Buka **https://resend.com**
2. Klik **Get Started** / **Sign Up**
3. Daftar pakai email (bisa pakai email pribadi atau `admin@lalakon.id`)
4. Verifikasi email pendaftaran

### Pilih Plan

| Plan | Harga | Email/Bulan | Limit Harian | Rekomendasi |
|------|-------|-------------|:------------:|:-----------:|
| **Free** | $0 | 3.000 | 100/hari | ✅ Cukup untuk development & awal launch |
| Pro | $20 | 50.000 | Unlimited | Nanti kalau user > 500 |
| Scale | $90 | 100.000 | Unlimited | Nanti kalau user > 2000 |

> 💡 **Pakai Free dulu!** 3.000 email/bulan cukup untuk ratusan user. Upgrade nanti kalau perlu.

---

## LANGKAH 2: Buat API Key

1. Login ke **Resend Dashboard**
2. Klik **API Keys** di sidebar kiri
3. Klik **Create API Key**
4. Isi:
   - **Name:** `lalakon-backend`
   - **Permission:** pilih **Sending access** (jangan Full access, lebih aman)
   - **Domain:** pilih **All domains** (atau domain spesifik nanti)
5. Klik **Add**
6. **COPY API KEY SEKARANG** — hanya muncul sekali!
7. Simpan ke `.env`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **PENTING:** API Key hanya ditampilkan SEKALI. Kalau hilang, harus buat ulang.

---

## LANGKAH 3: Verifikasi Domain

### Kenapa perlu?
- Tanpa verifikasi domain, email dikirim dari `onboarding@resend.dev` ← terlihat tidak profesional & sering masuk spam
- Dengan verifikasi, email dikirim dari `noreply@lalakon.id` ← profesional & trusted

### Cara verifikasi:

#### 3a. Tambah Domain di Resend
1. Klik **Domains** di sidebar
2. Klik **Add Domain**
3. Isi domain: `lalakon.id`
4. Region: pilih **Singapore (ap-southeast-1)** ← terdekat
5. Klik **Add**

#### 3b. Setting DNS Records
Setelah klik Add, Resend akan menampilkan **3 DNS records** yang harus ditambahkan:

| Tipe | Name | Value | Keterangan |
|------|------|-------|-----------|
| **TXT** | `resend._domainkey.lalakon.id` | `p=MIGfMA0GCS...` | DKIM — tanda tangan email |
| **TXT** | `lalakon.id` | `v=spf1 include:amazonses.com ~all` | SPF — izinkan Resend kirim email |
| **MX** | `feedback.lalakon.id` | `feedback-smtp.us-east-1.amazonses.com` | Bounce handling |

#### 3c. Tambahkan di DNS Provider
1. Login ke panel DNS domain `lalakon.id` (Niagahoster / Namecheap / Cloudflare)
2. Masuk ke **DNS Management** / **DNS Zone Editor**
3. Tambahkan 3 record di atas satu per satu
4. Simpan

#### 3d. Verifikasi di Resend
1. Kembali ke Resend Dashboard → **Domains**
2. Klik **Verify** di domain `lalakon.id`
3. Tunggu beberapa menit (kadang bisa sampai 24 jam tergantung DNS provider)
4. Kalau sudah hijau ✅ → domain terverifikasi!

> 💡 **Kalau belum punya domain:** Untuk development, bisa pakai email dari `onboarding@resend.dev` dulu. Domain bisa diverifikasi nanti sebelum production.

---

## LANGKAH 4: Test Kirim Email

Bisa test langsung dari dashboard Resend, atau dari kode:

```typescript
// Test sederhana di NestJS
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxxxxxxxxxxxxx');

await resend.emails.send({
  from: 'Lalakon <noreply@lalakon.id>',  // atau onboarding@resend.dev kalau belum verify domain
  to: 'emailkamu@gmail.com',
  subject: 'Test Email dari Lalakon',
  html: '<h1>Halo!</h1><p>Email dari Lalakon berhasil terkirim.</p>',
});
```

---

## Yang TIDAK Perlu Disetup

### ❌ Webhooks (Delivery Events)
- Untuk tracking apakah email delivered, opened, bounced
- Tidak kritis untuk Lalakon — kita hanya perlu **kirim** email
- Kalau nanti mau tracking, bisa ditambah belakangan

### ❌ Audiences & Contacts
- Fitur CRM dan newsletter management
- Lalakon bukan platform email marketing
- **SKIP**

### ❌ Broadcast
- Kirim email massal ke banyak subscriber sekaligus
- Kita kirim email satu per satu (transaksional), bukan broadcast
- **SKIP**

---

## Estimasi Biaya

| Pengguna Aktif | Email/Bulan (estimasi) | Plan | Biaya |
|:--------------:|:----------------------:|------|:-----:|
| ≤ 100 user | ~500 email | Free | **$0** |
| ≤ 500 user | ~2.500 email | Free | **$0** |
| ≤ 2.000 user | ~10.000 email | Pro | **$20/bulan** |
| ≤ 5.000 user | ~25.000 email | Pro | **$20/bulan** |

> **Estimasi email per user:** verifikasi (1) + konfirmasi bayar (1) + reminder (1) + notif film baru (~2) = ~5 email/bulan/user

### Kesimpulan: **GRATIS** untuk tahap awal. 🎉

---

## Setting di File .env

```env
# ===== RESEND =====
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Lalakon <noreply@lalakon.id>
```

---

## Checklist Setup Resend

- [ ] Daftar akun di resend.com
- [ ] Pilih plan Free
- [ ] Buat API Key (`lalakon-backend`, Sending access)
- [ ] Simpan API Key ke `.env`
- [ ] Tambah domain `lalakon.id`
- [ ] Tambah 3 DNS records (DKIM, SPF, MX)
- [ ] Verifikasi domain
- [ ] Test kirim email
