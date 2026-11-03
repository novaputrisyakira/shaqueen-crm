@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: Pastikan Git dan Node berada dalam PATH
set "PATH=C:\Users\Thinkpad\.gemini\antigravity\scratch\git\cmd;C:\Users\Thinkpad\.gemini\antigravity\scratch\git\ucrt64\bin;%PATH%"

echo ========================================================
echo       MEMBUKA HALAMAN OTORISASI / TOKEN GITHUB
echo ========================================================
echo.
echo Membuka peramban browser ke halaman resmi GitHub...
start "" "https://github.com/settings/tokens/new?scopes=repo&description=Shaqueen+Food+CRM"
echo.
echo Halaman browser telah dibuka!
echo.
echo Panduan Cepat Otorisasi:
echo  1. Pastikan Anda sudah login ke akun GitHub di browser Anda.
echo  2. Izin 'repo' dan deskripsi 'Shaqueen Food CRM' sudah terisi otomatis.
echo  3. Gulir ke bagian paling bawah halaman, lalu klik tombol hijau 'Generate token'.
echo  4. Salin (copy) kode token yang muncul (format: ghp_...).
echo.
echo ========================================================
echo  PILIHAN TINDAKAN:
echo  - Masukkan/tempel token di bawah ini untuk langsung push sekarang, ATAU
echo  - Cukup tekan [ENTER] jika ingin menempelkan token ke chat AI.
echo ========================================================
echo.
set /p TOKEN_INPUT="Tempel Token GitHub di sini (atau tekan Enter): "

if "!TOKEN_INPUT!"=="" (
    echo.
    echo Token belum dimasukkan. Anda dapat menempelkan token ke layar chat AI!
    echo.
    pause
    exit /b 0
)

echo.
echo Menjalankan proses push otomatis ke GitHub menggunakan token Anda...
node "%~dp0scripts\push-to-github.mjs" --token=!TOKEN_INPUT!
echo.
pause
