# 🐰 Panduan Setup Akun Bunny.net Baru (Sinea)

Dokumen ini menjelaskan langkah demi langkah untuk melakukan konfigurasi akun Bunny.net yang baru, serta bagaimana mendapatkan **8 variabel wajib** untuk dimasukkan ke file `.env` sistem Sinea.

---

## Ringkasan Konfigurasi `.env`

Berikut adalah 8 variabel Bunny.net yang ada pada file `.env` Anda:

```env
# ─── Bunny.net Configuration ───
BUNNY_API_KEY=xxx
BUNNY_STORAGE_ZONE=xxx
BUNNY_STORAGE_HOST=xxx
BUNNY_STORAGE_PASSWORD=xxx
BUNNY_CDN_URL=xxx
BUNNY_STREAM_LIBRARY_ID=xxx
BUNNY_STREAM_API_KEY=xxx
BUNNY_TOKEN_KEY=xxx
```

---

## Langkah Setup & Pengambilan Variabel

### 1. `BUNNY_API_KEY` (Global Account API Key)
*   **Kegunaan:** Digunakan oleh backend untuk melakukan integrasi global ke akun Bunny.net Anda.
*   **Cara mendapatkan:**
    1. Login ke Dashboard Bunny.net.
    2. Klik avatar profil Anda di pojok kanan atas, lalu pilih **Account Settings** (atau klik menu **Account**).
    3. Scroll ke bagian paling bawah ke panel **API Key**.
    4. Salin nilai API Key tersebut.
    5. Masukkan ke `.env` sebagai:
       `BUNNY_API_KEY=api_key_global_anda`

---

### 2. `BUNNY_STORAGE_ZONE` (Nama Zone Penyimpanan)
*   **Kegunaan:** Nama wadah penyimpanan lokal untuk file statis (poster, trailer film, gambar).
*   **Cara setup & mendapatkan:**
    1. Di sidebar kiri dashboard Bunny, klik menu **Storage**.
    2. Klik tombol **+ Add Storage Zone**.
    3. Tentukan nama zone unik, contoh: `sinea-storage`.
    4. Pada bagian **Main Storage Region**, pilih **Singapore (SG)** (karena server terdekat dari Indonesia).
    5. Klik **Create Storage Zone**.
    6. Nama zone yang Anda buat dimasukkan ke `.env` sebagai:
       `BUNNY_STORAGE_ZONE=sinea-storage`

---

### 3. `BUNNY_STORAGE_HOST` (Host Storage Region)
*   **Kegunaan:** Alamat endpoint API Storage sesuai wilayah server Singapura.
*   **Cara mendapatkan:**
    1. Karena kita menggunakan server Singapura (SG), isi nilai ini secara manual dengan:
       `sg.storage.bunnycdn.com`
    2. Masukkan ke `.env` sebagai:
       `BUNNY_STORAGE_HOST=sg.storage.bunnycdn.com`
    *(Catatan: Jika di kemudian hari membuat storage zone di region utama/Falkenstein Jerman, gunakan `storage.bunnycdn.com`)*.

---

### 4. `BUNNY_STORAGE_PASSWORD` (FTP & API Password)
*   **Kegunaan:** Kunci keamanan untuk otentikasi upload dan delete file dari backend ke Storage Zone.
*   **Cara mendapatkan:**
    1. Masuk ke halaman Storage Zone yang telah dibuat (`sinea-storage`).
    2. Pada menu sidebar kiri dalam Storage Zone tersebut, klik **FTP & API Access**.
    3. Temukan baris **Password** atau **Read & Write API Key**.
    4. Klik tombol *show* (ikon mata) dan salin nilai password tersebut.
    5. Masukkan ke `.env` sebagai:
       `BUNNY_STORAGE_PASSWORD=password_ftp_api_anda`

---

### 5. `BUNNY_CDN_URL` (Alamat Pull Zone)
*   **Kegunaan:** Alamat URL CDN cepat untuk mengakses file statis (poster, trailer).
*   **Cara setup & mendapatkan:**
    1. Setelah Storage Zone dibuat, Bunny akan secara otomatis menawarkan pembuatan **Linked Pull Zone** (CDN).
    2. Jika belum terbuat, klik menu **Connected Pull Zones** di menu sebelah kiri Storage Zone Anda, lalu buat Pull Zone baru dengan nama, misal: `sinea-cdn`.
    3. Salin URL Pull Zone default yang dihasilkan (biasanya berakhiran `.b-cdn.net`), contoh: `https://sinea-cdn.b-cdn.net`.
    4. Masukkan ke `.env` sebagai:
       `BUNNY_CDN_URL=https://sinea-cdn.b-cdn.net`

---

### 6. `BUNNY_STREAM_LIBRARY_ID` (ID Perpustakaan Video)
*   **Kegunaan:** ID khusus untuk fitur Bunny Stream (layanan hosting film terenkripsi HLS).
*   **Cara setup & mendapatkan:**
    1. Di sidebar kiri dashboard Bunny, klik menu **Stream** (ikon tombol Play).
    2. Klik tombol **+ Add Video Library**.
    3. Beri nama perpustakaan video Anda, contoh: `sinea-stream`.
    4. Pilih region penyimpanan utama: **Singapore (SG)**.
    5. Klik **Create**.
    6. Setelah dibuat, buka halaman dashboard library video tersebut. Perhatikan ID numerik yang tertera di samping judul library, atau ambil dari baris URL browser Anda (contoh: `https://panel.bunny.net/stream/656201/...` -> ID nya adalah `656201`).
    7. Masukkan ke `.env` sebagai:
       `BUNNY_STREAM_LIBRARY_ID=656201`

---

### 7. `BUNNY_STREAM_API_KEY` (API Key Khusus Stream)
*   **Kegunaan:** Hak akses backend untuk melakukan upload video film ke Bunny Stream.
*   **Cara mendapatkan:**
    1. Masuk ke perpustakaan video Stream Anda (`sinea-stream`).
    2. Pada menu sidebar kiri perpustakaan tersebut, klik menu **API**.
    3. Salin string **API Key** khusus untuk Stream Library tersebut.
    4. Masukkan ke `.env` sebagai:
       `BUNNY_STREAM_API_KEY=api_key_stream_anda`

---

### 8. `BUNNY_TOKEN_KEY` (Token Security Key)
*   **Kegunaan:** Kunci rahasia untuk membuat URL bertanda tangan (Signed URL) sehingga video film terlindungi dan tidak bisa diunduh secara ilegal.
*   **Cara setup & mendapatkan:**
    1. Buka perpustakaan video Stream Anda (`sinea-stream`).
    2. Di menu sebelah kiri, klik menu **Security**.
    3. Aktifkan opsi **Enable Token Authentication** (centang tombol switch ke ON).
    4. Salin string **Token Authentication Key** yang muncul.
    5. **Penting:** Pastikan opsi **Block Direct URL Access** diaktifkan (ON) untuk keamanan penuh.
    6. Masukkan ke `.env` sebagai:
       `BUNNY_TOKEN_KEY=token_authentication_key_anda`

---

## Checklist Konfigurasi di Server (VPS)
Setelah mendapatkan seluruh nilai di atas, perbarui file `.env` di server:
1. SSH ke VPS Anda.
2. Edit file `.env` di root project (`/var/www/sinea/.env` dan `/var/www/sinea/apps/backend/.env`).
3. Masukkan nilai-nilai baru yang telah Anda dapatkan.
4. Restart PM2 agar konfigurasi baru terbaca:
   ```bash
   pm2 restart all
   ```
