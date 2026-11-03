@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: Pastikan Git dan Git Credential Manager berada dalam PATH
set "PATH=C:\Users\Thinkpad\.gemini\antigravity\scratch\git\cmd;C:\Users\Thinkpad\.gemini\antigravity\scratch\git\ucrt64\bin;%PATH%"

:MENU
cls
echo ========================================================
echo       SHAQUEEN FOOD CRM - PUSH OTOMATIS KE GITHUB
echo ========================================================
echo.
echo Pilih metode:
echo   [1] Buka Halaman Otorisasi GitHub di Browser
echo   [2] Otomatis via Token GitHub (Membuat repo otomatis jika belum ada)
echo   [3] Manual via URL Repository ^& Browser Login (Git Credential Manager)
echo   [4] Keluar
echo.
set /p PILIHAN="Pilihan Anda (1/2/3/4): "

if "%PILIHAN%"=="1" goto BUKA_OTORISASI
if "%PILIHAN%"=="2" goto PUSH_TOKEN
if "%PILIHAN%"=="3" goto PUSH_URL
if "%PILIHAN%"=="4" exit /b 0
goto PUSH_TOKEN

:BUKA_OTORISASI
echo.
echo Membuka halaman otorisasi GitHub di peramban browser...
start "" "https://github.com/settings/tokens/new?scopes=repo&description=Shaqueen+Food+CRM"
echo.
echo Halaman otorisasi GitHub telah dibuka di browser Anda!
echo 1. Gulir ke bagian paling bawah.
echo 2. Klik tombol hijau 'Generate token'.
echo 3. Salin token tersebut (ghp_...).
echo.
pause
goto MENU

:PUSH_TOKEN
echo.
echo Menjalankan modul sinkronisasi otomatis GitHub...
node "%~dp0scripts\push-to-github.mjs"
goto SELESAI

:PUSH_URL
echo.
echo Pastikan repository sudah dibuat di GitHub:
echo 👉 https://github.com/new?name=shaqueen-crm
echo.
set /p REPO_URL="Masukkan URL Repository GitHub Anda (contoh: https://github.com/username/shaqueen-crm.git): "
if "%REPO_URL%"=="" (
    echo [ERROR] URL repository tidak boleh kosong.
    goto SELESAI
)

echo.
echo Menghubungkan ke remote repository...
git config credential.helper "C:/Users/Thinkpad/.gemini/antigravity/scratch/git/ucrt64/bin/git-credential-manager.exe"
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Melakukan push ke GitHub...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   BERHASIL! Seluruh kode proyek Shaqueen Food 
    echo   berhasil di-push ke GitHub!
    echo ========================================================
) else (
    echo.
    echo [CATATAN] Jika diminta otorisasi, jendela peramban akan terbuka
    echo atau Anda dapat memasukkan Personal Access Token (PAT).
    echo Generate token di: https://github.com/settings/tokens/new?scopes=repo
)
goto SELESAI

:SELESAI
echo.
pause
