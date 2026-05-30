# FULL AUTO FIX BUG REQUEST

Repo: SmartPortal

Tolong perbaiki bug aplikasi secara menyeluruh, bukan hanya review.

Masalah utama:
1. Tombol login tidak muncul.
2. User tidak bisa login ke dalam portal.
3. Hamburger menu mobile tidak berfungsi normal.
4. Halaman portal warga bocor ke halaman portal admin.

Target hasil:
- Tombol login muncul di desktop dan mobile.
- Login berhasil masuk ke portal sesuai role.
- Role admin masuk portal admin.
- Role warga masuk portal warga.
- Warga tidak bisa akses halaman admin melalui URL langsung.
- Admin tidak tercampur dengan halaman warga.
- Hamburger mobile bisa dibuka, ditutup, dan menu bisa diklik.
- Sidebar mobile tidak menutup tombol/menu secara salah.
- Tidak ada fitur lain yang hilang.
- Tidak ada perubahan backend/Railway/database kecuali benar-benar diperlukan.

Validasi:
- pnpm install
- pnpm build
- pnpm typecheck
- cek login
- cek sidebar mobile
- cek role guard admin/warga
- cek navigasi menu

Jangan:
- Jangan menghapus fitur lain.
- Jangan menghilangkan dashboard.
- Jangan menghilangkan menu admin.
- Jangan menghilangkan menu warga.
- Jangan membuat patch file yang menumpuk.
- Jangan hanya memperbaiki tampilan tanpa memperbaiki root cause.
