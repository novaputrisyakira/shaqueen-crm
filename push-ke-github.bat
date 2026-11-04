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
echo   [1] Push Langsung (Otomatis simpan commit & push ke GitHub)
echo   [2] Otomatis via Token GitHub (Input Personal Access Token / PAT)
echo   [3] Buka Halaman Otorisasi GitHub di Browser
echo   [4] Manual via URL Repository Kustom
echo   [5] Keluar
echo.
set /p PILIHAN="Pilihan Anda (1/2/3/4/5) [Default: 1]: "

if "%PILIHAN%"=="" set PILIHAN=1
if "%PILIHAN%"=="1" goto PUSH_DIRECT
if "%PILIHAN%"=="2" goto PUSH_TOKEN
if "%PILIHAN%"=="3" goto BUKA_OTORISASI
if "%PILIHAN%"=="4" goto PUSH_URL
if "%PILIHAN%"=="5" exit /b 0
goto PUSH_DIRECT

:PUSH_DIRECT
echo.
echo ========================================================
echo 1. Menyimpan seluruh perubahan berkas ke Git commit...
echo ========================================================
git add -A
git commit -m "fix(data): ensure permanent 0 transactions and prevent rehydration on load and reload"
echo.
echo ========================================================
echo 2. Menghubungkan ke remote origin...
echo ========================================================
git config credential.helper "C:/Users/Thinkpad/.gemini/antigravity/scratch/git/ucrt64/bin/git-credential-manager.exe"
git remote remove origin 2>nul
git remote add origin https://github.com/novaputrisyakira/shaqueen-crm.git
git branch -M main
echo.
echo ========================================================
echo 3. Mengirim (push) ke https://github.com/novaputrisyakira/shaqueen-crm.git ...
echo ========================================================
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   BERHASIL! Seluruh kode proyek Shaqueen Food 
    echo   berhasil di-push ke GitHub!
    echo ========================================================
) else (
    echo.
    echo [CATATAN] Jika push ditolak atau membutuhkan token otentikasi,
    echo silakan gunakan metode [2] (Otomatis via Token GitHub).
)
goto SELESAI

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
set /p LANJUT="Apakah Anda sudah menyalin token dan ingin langsung melanjutkan push? (Y/T): "
if /i "!LANJUT!"=="Y" goto PUSH_TOKEN
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
set /p REPO_URL="Masukkan URL Repository GitHub Anda [Default: https://github.com/novaputrisyakira/shaqueen-crm.git]: "
if "%REPO_URL%"=="" set REPO_URL=https://github.com/novaputrisyakira/shaqueen-crm.git

echo.
echo Menyimpan seluruh perubahan berkas ke Git commit...
git add -A
git commit -m "fix(data): ensure permanent 0 transactions and prevent rehydration on load and reload"

echo.
echo Menghubungkan ke remote repository %REPO_URL% ...
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
