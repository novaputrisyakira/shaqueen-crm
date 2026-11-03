@echo off
chcp 65001 > nul
echo ========================================================
echo       MEMBUKA HALAMAN OTORISASI / TOKEN GITHUB
echo ========================================================
echo.
echo Membuka peramban browser ke halaman resmi GitHub...
start "" "https://github.com/settings/tokens/new?scopes=repo&description=Shaqueen+Food+CRM"
echo.
echo Halaman browser telah dibuka.
echo 1. Gulir ke bagian bawah halaman GitHub
echo 2. Klik tombol hijau "Generate token"
echo 3. Salin kode token yang muncul (berawalan ghp_...)
echo 4. Jalankan push-ke-github.bat atau tempel token ke chat AI!
echo.
pause
