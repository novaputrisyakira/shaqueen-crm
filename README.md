# Shaqueen — Sistem Operasional & Retensi Pelanggan Shaqueen Food

Aplikasi internal yang dirancang khusus untuk operasional bisnis **Shaqueen Food**. Mengelola retensi pelanggan langsung (B2C), manajemen mitra reseller grosir toko/agen (B2B Beli Putus / Cash & Carry), dan katalog master produk inti (*Cuanki Instan*, *Cuanki Ori*, *Keripik Moringa*, dan *Pilus*).

---

## 🌟 Identitas Brand & Desain Appetizing

- **Nama Aplikasi**: Shaqueen
- **Tagline**: Sistem Operasional & Retensi Pelanggan Shaqueen Food
- **Warna Utama**: 
  - Vibrant Orange (Primary / B2C): `#E85D04`
  - Deep Sage Green (Secondary / Accent / B2B): `#40796C`
  - Background (Ivory / Putih Tulang): `#F4F1DE`
  - Text & Sidebar (Deep Espresso): `#2B1E16`
- **Tipografi**: Plus Jakarta Sans & Inter (Geometric Modern)
- **Brand Logo**: Komponen logo dinamis di Sidebar & Login, dilengkapi fitur upload file logo custom di menu **Pengaturan**.

---

## 🚀 Fitur Utama & Modul

### 1. 🏠 Dashboard Operasional
- **Stat Cards**: Total Omzet Bulan Ini (B2C + B2B), Penjualan Retail B2C, Omzet Grosir (B2B), dan Follow-Up Menunggu Hari Ini.
- **Grafik Komparasi B2C vs B2B**: Proporsi omzet, volume transaksi, dan perbandingan performa saluran retail vs grosir.
- **Tren Penjualan 7 Hari**: Grafik perolehan harian B2C & B2B.
- **Widget Trigger Follow-Up Hari Ini**: Akses cepat kirim WhatsApp untuk pesanan yang memasuki jadwal H+2 dan H+30.
- **Leaderboard Toko Mitra Reseller Teratas**: Toko mitra reseller dengan akumulasi pembelian dan volume karton tertinggi.
- **Peringatan Stok Menipis**: Alert otomatis untuk varian cemilan dengan stok < 25 pcs.

### 2. 📦 Master Katalog Produk
- Pendaftaran barang dagangan dengan sistem **Dual-Pricing**:
  - Harga Jual B2C (Retail Shopee/TikTok/WA)
  - Harga Grosir B2B (Grosir Reseller per Karton/Dus)
  - Perhitungan otomatis Margin Keuntungan (Rp & %)
  - Konfigurasi Satuan Grosir (Karton, Dus, Bal, Pack) dan Konversi Satuan ke Pcs
- Varian Produk Inti Shaqueen Food:
  - Cuanki Instan Super Pedas (Pouch 150g)
  - Cuanki Ori Gurih Kaldu Sapi (Pouch 150g)
  - Keripik Moringa Spicy Cheese 100g
  - Keripik Moringa Balado Manis 100g
  - Pilus Renyah Rasa Kencur Cikur 250g
  - Paket Bundling Cuanki Mantap + Keripik Moringa
- Quick Action: Tambah Produk, Edit, Hapus, Penyesuaian Cepat Stok (+/-), dan Switch Status (Aktif/Habis).

### 3. 👥 Pelanggan Retail (B2C)
- **Database Pelanggan Lintas Platform**: Nama, No. WhatsApp, Platform Asal (WhatsApp / Shopee / TikTok), Kota, Tag Status (Pelanggan Baru, Loyal, At-Risk), Total Orders, Total Spent (LTV).
- **Form Input Transaksi Retail (Sistem Keranjang)**:
  - Tombol `+ Tambah Produk Lain` untuk checkout multi-produk sekaligus.
  - Perhitungan otomatis Total Tagihan real-time.
  - Pemotongan otomatis stok fisik masing-masing produk terpilih di Master Produk.
  - Logika Repeat Order (Upsert): Cek No. WhatsApp, jika sudah terdaftar otomatis tambah Total Order (+1) dan akumulasikan LTV (transaksi multi-produk dihitung 1x order).
- **Aksi Pelanggan**: Ikon minimalis Pencil (Edit) dan Trash merah (Hapus), serta tombol Chat WhatsApp langsung.

### 4. 📋 Pipeline Follow-Up Retensi (Kanban Board B2C)
- 4 Kolom Alur Kanban:
  1. 📦 **Pesanan Diproses** (Baru bayar, persiapan packing bubble wrap)
  2. 🚚 **Sedang Dikirim** (No. resi kurir aktif / J&T, SiCepat, SPX)
  3. ⭐ **Follow-up H+2 (Minta Review)** (Pesanan sampai, tanyakan rasa cuanki/moringa)
  4. 🎁 **Follow-up H+30 (Target Promo & Restock)** (Cemilan diperkirakan habis, ajakan repeat order)
- **Trigger Auto-WA Pintar**:
  - Modal pratinjau pesan otomatis dengan template tersubstitusi (`{nama}` dan `{produk}`).
  - Tombol **Buka di WhatsApp (`wa.me`)** langsung ke chat tujuan.
  - Tombol **Simulasi API Gateway** dengan audit log tersimpan.

### 5. 🏪 Mitra Reseller B2B (Beli Putus / Cash & Carry)
- **Database Mitra Reseller B2B**: Nama Toko, Nama Pemilik, No. WA, Alamat/Lokasi, Total Akumulasi Pembelian, Total Karton Dibeli, Status.
- **Tambah Mitra Baru**: Tombol utama `+ Tambah Mitra Baru` untuk pendaftaran toko reseller.
- **Form Input Transaksi Grosir (Cash & Carry)**:
  - Satuan dinamis Karton/Dus dengan konversi isi otomatis ke Pcs.
  - Harga B2B grosir dan kalkulasi total pembayaran lunas langsung.
  - Saat transaksi disubmit: stok fisik gudang langsung terpotong, pembayaran tercatat lunas, omzet bertambah ke Omzet Grosir (B2B), dan total akumulasi pembelian toko terupdate.
- **Riwayat Transaksi Grosir**: Tanggal, Nama Toko, Produk & Jumlah Grosir (misal: 2 Karton / 24 pcs), Total Pembayaran Lunas (Rp), dan Status (Lunas).

### 6. ⚙️ Pengaturan & Identitas
- Upload file logo brand custom (tersimpan persisten di storage).
- Ubah template pesan WhatsApp H+2 dan H+30 secara fleksibel.
- Konfigurasi Supabase URL & Anon Key + Script SQL Migration.
- Backup & Restore data JSON.

---

## 🛠️ Panduan Menjalankan Aplikasi

1. **Persiapan Dependensi**:
   ```bash
   cd C:\Users\Thinkpad\.gemini\antigravity\scratch\shaqueen-crm
   npm install
   ```

2. **Jalankan Mode Pengembangan**:
   ```bash
   npm run dev
   ```
   Aplikasi Next.js akan aktif di `http://localhost:3000`.

3. **Versi Standalone Produksi**:
   Buka `dist/index.html` langsung di browser atau jalankan `jalankan-crm.bat`.

4. **Setup Database Supabase (Opsional)**:
   - Buka SQL Editor di Dashboard Supabase Anda.
   - Salin isi file `supabase/schema.sql`.
   - Jalankan query untuk membuat semua tabel, indeks, dan data awal secara otomatis.
