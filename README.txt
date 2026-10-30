# Website PORSENI MTs — Versi Offline

## Isi folder
- `index.html`: website publik (beranda, profil, informasi, daftar lomba, galeri konsep)
- `pendaftaran.html`: formulir pendaftaran dengan unggah foto, ijazah, dan KK per peserta; semua berkas ikut di dalam file `.json`
- `rekap.html`: alat panitia untuk membaca beberapa file JSON dan mengekspor rekap JSON/CSV
- `style.css`: gaya responsif
- `app.js`: pemuatan data JSON dan interaksi beranda
- `data/profil.json`, `data/lomba.json`, `data/informasi.json`: konten yang dapat diedit

## Cara mencoba
Karena browser biasanya memblokir `fetch()` JSON pada file yang dibuka langsung dengan `file://`, gunakan server lokal:
1. Ekstrak folder ZIP.
2. Jika memakai XAMPP, salin folder `porseni-mts-offline` ke `C:\xampp\htdocs\`.
3. Jalankan Apache dari XAMPP.
4. Buka `http://localhost/porseni-mts-offline/`
5. Formulir: `http://localhost/porseni-mts-offline/pendaftaran.html`
6. Rekap panitia: `http://localhost/porseni-mts-offline/rekap.html`

Alternatif server lokal sederhana bisa digunakan jika tersedia. Internet tidak dibutuhkan untuk membaca file JSON; font eksternal hanya peningkatan visual, dan font sistem tetap digunakan jika offline.

## Alur pendaftaran offline
1. Operator membuka `pendaftaran.html`.
2. Isi data madrasah, pilih cabang lomba, isi peserta dan pembina.
3. Unggah foto siswa (JPG/PNG, maks. 2 MB), ijazah (JPG/PNG/PDF, maks. 5 MB), dan KK (JPG/PNG/PDF, maks. 5 MB) untuk setiap peserta.
4. Klik **Ekspor JSON**. File bernama `PORSENI-YYYYMMDD-XXXXX.json` diunduh bersama dokumen yang disandikan sebagai Base64.
5. Serahkan file JSON itu kepada panitia melalui media yang disepakati (flashdisk, kabel, atau aplikasi pesan).
6. Panitia membuka `rekap.html`, memilih satu atau banyak file JSON, lalu ekspor rekap gabungan JSON/CSV.

## Cara mengubah data lomba
Edit `data/lomba.json` dengan editor teks. Setiap lomba idealnya punya `id` unik. Properti:
- `id`: contoh `LOMBA-010`
- `nama`: nama lomba
- `kategori`: Seni / Olahraga / Akademik atau sesuai kebutuhan
- `jenis`: Perorangan atau Beregu
- `kategoriPeserta`: informasi ringkas untuk kartu lomba
- `ikon`: emoji
- `deskripsi`: penjelasan singkat

**Penting:** nama lomba contoh belum tentu sesuai juknis resmi. Ganti dengan cabang lomba, kategori putra/putri, kuota anggota, syarat, jadwal, tanggal, logo, dan identitas resmi dari panitia.

## Batasan versi awal
- Pendaftaran tidak dikirim otomatis ke panitia; file harus diserahkan manual.
- Belum ada akun/login, validasi kuota otomatis, tanda tangan digital, atau pencegahan pendaftaran ganda lintas perangkat.
- Rekap hanya ada di memori browser sampai diekspor. Simpan file rekap dan file asli sebagai cadangan.
- Data peserta dan dokumen seperti KK/ijazah adalah data pribadi. Batasi akses dan jangan membagikan berkas ke pihak yang tidak berkepentingan. Karena file Base64 menambah ukuran JSON, hindari dokumen yang terlalu besar. Pada halaman rekap, klik **Unduh dokumen** untuk mengekstrak dokumen yang disertakan.
