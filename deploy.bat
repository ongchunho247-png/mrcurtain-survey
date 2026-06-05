@echo off
chcp 65001 >nul
title MrCurtain Survey — Deploy to GitHub

echo.
echo ============================================================
echo   MrCurtain Survey — Tu dong deploy len GitHub + Netlify
echo ============================================================
echo.

:: Chuyển vào đúng thư mục project (dù double-click từ đâu)
cd /d "%~dp0"

:: Chạy deploy script
npm run deploy:update

echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅  Deploy thanh cong! Netlify se tu cap nhat trong ~30 giay.
) else (
    echo ❌  Deploy that bai. Xem logs/diagnose-log.txt de biet chi tiet.
)

echo.
echo Nhan phim bat ky de dong cua so nay...
pause >nul
