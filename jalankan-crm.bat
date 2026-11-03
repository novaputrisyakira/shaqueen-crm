@echo off
title Shaqueen - Server Localhost:3000
echo ===================================================
echo   SHAQUEEN - SISTEM OPERASIONAL SHAQUEEN FOOD
echo ===================================================
echo Membuka aplikasi di http://localhost:3000 ...
start http://localhost:3000
"C:\Users\Thinkpad\AppData\Local\Programs\Python\Python312\python.exe" -m http.server 3000 --directory "%~dp0dist"
pause
