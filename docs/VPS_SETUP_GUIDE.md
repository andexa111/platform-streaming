# 🖥️ Panduan Setup VPS — Lalakon

**VPS:** Alibaba Cloud — RW-4GN2TL
**Spek:** 2 vCPU, 2GB RAM, 40GB ESSD
**OS:** Ubuntu 22.04 64-bit
**Region:** Indonesia
**IP Publik:** 147.139.214.82
**IP Private:** 172.19.22.43
**Hostname:** RW-4GN2TL
**Username Alibaba:** 216250@5505535221601074.onaliyun.com
**Expired At:** 6 Mei 2026
**Akses Terminal:** Alibaba Workbench (browser) — login sebagai `admin`

---

## 📊 Status Setup VPS (Terakhir: 6 April 2026)

| # | Tahap | Status |
|:-:|-------|:------:|
| 0 | Akses VPS (via Workbench) | ✅ Selesai |
| 1 | Update sistem & install tools | ✅ Selesai |
| 2 | Swap 2GB | ✅ Selesai |
| 3 | Node.js v20.20.2 + npm v10.8.2 | ✅ Selesai |
| 4 | PostgreSQL 16 (install) | ✅ Selesai |
| 4b | PostgreSQL (buat database & user) | ⬜ Belum |
| 5 | Nginx (install) | ✅ Selesai |
| 5b | Nginx (config reverse proxy Lalakon) | ⬜ Belum |
| 6 | PM2 | ✅ Selesai |
| 7 | Firewall (SSH + Nginx) | ✅ Selesai |
| 8 | Clone repo & setup .env | ⬜ Belum |
| 9 | Build & jalankan | ⬜ Belum |
| 10 | Pointing domain + SSL | ⬜ Belum |

## TAHAP 0: Akses VPS via SSH

### Dari Windows (Pakai Terminal / PowerShell)

```bash
ssh root@147.139.214.82
```

> Kalau diminta "Are you sure you want to continue connecting?" ketik `yes`
> Masukkan password VPS kamu

### Alternatif: Pakai PuTTY
1. Download PuTTY dari putty.org
2. Host Name: `147.139.214.82`
3. Port: `22`
4. Klik Open → masukkan username `root` → password

### Kalau Pakai Username Khusus Alibaba:
```bash
ssh 216250@5505535221601074.onaliyun.com@147.139.214.82
```
> Atau coba SSH langsung pakai `root@147.139.214.82` (biasanya bisa)

---

## TAHAP 1: Update Sistem & Install Dasar

Setelah berhasil masuk SSH, jalankan satu per satu:

```bash
# 1. Update sistem
sudo apt update && sudo apt upgrade -y

# 2. Install tools dasar
sudo apt install -y curl wget git unzip htop ufw software-properties-common
```

---

## TAHAP 2: Tambah Swap (PENTING — RAM cuma 2GB)

```bash
# Buat swap file 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Buat permanen (tetap aktif setelah restart)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verifikasi
free -h
```

Hasil yang diharapkan:
```
              total        used        free
Mem:          1.9Gi       ...         ...
Swap:         2.0Gi       0B          2.0Gi    ← Swap aktif!
```

---

## TAHAP 3: Install Node.js 20 (LTS)

```bash
# Install Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi
node -v    # harus v20.x.x
npm -v     # harus v10.x.x
```

---

## TAHAP 4: Install PostgreSQL 16

```bash
# Tambah repo PostgreSQL resmi
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update

# Install PostgreSQL 16
sudo apt install -y postgresql-16

# Verifikasi
sudo systemctl status postgresql    # harus "active (running)"
psql --version                      # PostgreSQL 16.x
```

### Setup Database & User untuk Lalakon

```bash
# Masuk ke PostgreSQL
sudo -u postgres psql

# Di dalam psql, jalankan:
CREATE USER lalakon WITH PASSWORD 'GANTI_PASSWORD_KUAT_KAMU';
CREATE DATABASE lalakon_db OWNER lalakon;
GRANT ALL PRIVILEGES ON DATABASE lalakon_db TO lalakon;
\q
```

> ⚠️ Ganti `GANTI_PASSWORD_KUAT_KAMU` dengan password yang kuat! Misal: `L4lak0n_DB_2026!`

### Verifikasi Koneksi

```bash
# Test login dengan user lalakon
psql -U lalakon -d lalakon_db -h localhost
# Masukkan password → kalau masuk berarti sukses
\q
```

> Kalau error "peer authentication failed", jalankan:
```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```
> Cari baris: `local all all peer`
> Ubah jadi: `local all all md5`
> Simpan (Ctrl+O, Enter, Ctrl+X), lalu restart:
```bash
sudo systemctl restart postgresql
```

---

## TAHAP 5: Install Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Start & auto-start
sudo systemctl start nginx
sudo systemctl enable nginx

# Verifikasi — buka browser: http://147.139.214.82
# Harus muncul halaman "Welcome to nginx!"
```

### Setup Reverse Proxy untuk Lalakon

```bash
# Buat config untuk Lalakon
sudo nano /etc/nginx/sites-available/lalakon
```

Copy-paste isi berikut:

```nginx
server {
    listen 80;
    server_name lalakon.id www.lalakon.id;  # ganti domain nanti

    # Frontend (Next.js) — port 3000
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (NestJS) — port 3001
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Webhook Midtrans (tanpa /api prefix)
    location /webhooks/ {
        proxy_pass http://localhost:3001/webhooks/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Simpan (Ctrl+O, Enter, Ctrl+X), lalu:

```bash
# Aktifkan config
sudo ln -s /etc/nginx/sites-available/lalakon /etc/nginx/sites-enabled/

# Hapus default config
sudo rm /etc/nginx/sites-enabled/default

# Test config valid
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## TAHAP 6: Install PM2 (Process Manager)

PM2 menjaga aplikasi tetap jalan walau SSH ditutup, dan auto-restart kalau crash.

```bash
# Install PM2 global
sudo npm install -g pm2

# Verifikasi
pm2 --version
```

---

## TAHAP 7: Setup Firewall

```bash
# Aktifkan UFW
sudo ufw allow OpenSSH         # SSH (port 22) — WAJIB!
sudo ufw allow 'Nginx Full'    # HTTP (80) + HTTPS (443)
sudo ufw enable                # Ketik 'y' untuk konfirmasi

# Verifikasi
sudo ufw status
```

Hasil yang diharapkan:
```
Status: active
To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

> ⚠️ **JANGAN skip langkah `allow OpenSSH`!** Kalau lupa, kamu terkunci dari VPS sendiri.

---

## TAHAP 8: Clone & Setup Project Lalakon

```bash
# Masuk ke folder home
cd /home

# Clone repo
git clone https://github.com/andexa111/platform-streaming.git lalakon
cd lalakon

# Install dependencies
npm install

# Buat file .env
cp .env.example .env
nano .env
```

### Isi .env di VPS:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://lalakon:PASSWORD_KAMU@localhost:5432/lalakon_db"

# JWT
JWT_SECRET="RANDOM_STRING_PANJANG_32_KARAKTER"

# App
PORT=3001
FRONTEND_URL="http://147.139.214.82"

# Resend (isi nanti)
RESEND_API_KEY=
RESEND_FROM_EMAIL=Lalakon <noreply@lalakon.id>

# Bunny (isi nanti)
BUNNY_STREAM_LIBRARY_ID=
BUNNY_STREAM_API_KEY=
BUNNY_TOKEN_SECURITY_KEY=
BUNNY_STORAGE_ZONE=
BUNNY_STORAGE_API_KEY=
BUNNY_CDN_URL=

# Midtrans (isi nanti)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
```

Simpan (Ctrl+O, Enter, Ctrl+X).

---

## TAHAP 9: Build & Jalankan

```bash
# Pastikan masih di /home/lalakon

# Jalankan Prisma migration
cd apps/backend
npx prisma migrate deploy
cd ../..

# Build project
npx turbo run build

# Jalankan dengan PM2
pm2 start apps/backend/dist/main.js --name "lalakon-backend"
pm2 start npm --name "lalakon-frontend" -- run start --prefix apps/frontend

# Auto-start saat VPS restart
pm2 startup
pm2 save
```

### Verifikasi Jalan

```bash
# Cek status
pm2 status

# Harus muncul:
# ┌────────────────────┬────┬──────┬───────┐
# │ App name           │ id │ mode │ status│
# ├────────────────────┼────┼──────┼───────┤
# │ lalakon-backend    │ 0  │ fork │ online│
# │ lalakon-frontend   │ 1  │ fork │ online│
# └────────────────────┴────┴──────┴───────┘

# Cek logs kalau ada error
pm2 logs
```

### Test di Browser

- Buka **http://147.139.214.82** → Halaman frontend
- Buka **http://147.139.214.82/api/** → Response backend "Hello World"

---

## TAHAP 10: Pointing Domain (Nanti)

Saat domain `lalakon.id` sudah siap:

1. Login ke panel DNS domain
2. Tambahkan DNS Record:

```
A Record:  lalakon.id       → 147.139.214.82
A Record:  www.lalakon.id   → 147.139.214.82
A Record:  api.lalakon.id   → 147.139.214.82   (opsional)
```

3. Install SSL (HTTPS) gratis via Let's Encrypt:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lalakon.id -d www.lalakon.id
```

---

## Perintah PM2 yang Sering Dipakai

```bash
pm2 status              # Lihat status semua app
pm2 logs                # Lihat log real-time
pm2 restart all         # Restart semua app
pm2 stop all            # Hentikan semua app
pm2 delete all          # Hapus semua app dari PM2
pm2 monit               # Monitor CPU & RAM real-time
```

---

## Perintah Deploy Ulang (Setelah Push Update)

```bash
cd /home/lalakon
git pull origin main
npm install
npx turbo run build
pm2 restart all
```

---

## Ringkasan Urutan Setup

| Tahap | Apa | Estimasi Waktu |
|:-----:|-----|:--------------:|
| 0 | SSH ke VPS | 2 menit |
| 1 | Update sistem & install tools | 5 menit |
| 2 | Tambah swap 2GB | 2 menit |
| 3 | Install Node.js 20 | 3 menit |
| 4 | Install PostgreSQL + buat database | 10 menit |
| 5 | Install & config Nginx | 10 menit |
| 6 | Install PM2 | 1 menit |
| 7 | Setup firewall | 2 menit |
| 8 | Clone repo & setup .env | 5 menit |
| 9 | Build & jalankan | 5 menit |
| 10 | Pointing domain + SSL | Nanti |
| | **TOTAL** | **~45 menit** |

---

## Troubleshooting

### Tidak bisa SSH
```bash
# Coba port lain
ssh root@147.139.214.82 -p 22
# Cek di dashboard Alibaba apakah Security Group port 22 sudah dibuka
```

### PostgreSQL connection refused
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Nginx 502 Bad Gateway
```bash
# Artinya backend/frontend belum jalan
pm2 status   # Cek apakah app online
pm2 logs     # Cek error
```

### RAM habis
```bash
free -h      # Cek penggunaan RAM
htop         # Monitor real-time (tekan Q untuk keluar)
```
