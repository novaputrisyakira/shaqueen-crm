@echo off
chcp 65001 > nul
echo ===================================================
echo   SHAQUEEN FOOD CRM - PUSH OTOMATIS KE GITHUB
echo ===================================================
echo.
echo Pastikan Anda sudah membuat repository di GitHub:
echo https://github.com/new
echo.
set /p REPO_URL="Masukkan URL Repository GitHub Anda (contoh: https://github.com/username/shaqueen-crm.git): "
if "%REPO_URL%"=="" (
    echo [ERROR] URL repository tidak boleh kosong.
    pause
    exit /b 1
)

echo.
echo Menghubungkan ke remote repository...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Melakukan push ke GitHub...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================================
    echo   BERHASIL! Seluruh kode proyek Shaqueen Food 
    echo   berhasil di-push ke GitHub!
    echo ===================================================
) else (
    echo.
    echo [CATATAN] Jika diminta password/autentikasi oleh GitHub:
    echo Gunakan Personal Access Token (PAT) Anda sebagai password.
    echo Buat token di: https://github.com/settings/tokens/new?scopes=repo
)
pause
