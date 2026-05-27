@echo off
chcp 65001 >nul
echo ============================================
echo   Fix git lock va deploy
echo ============================================
echo.

cd /d "%~dp0"

set LOCK=.git\index.lock
set LOCK_BAK=.git\index.lock.bak

if exist "%LOCK_BAK%" del /F /Q "%LOCK_BAK%" 2>nul

if exist "%LOCK%" (
    echo [1] Tim thay index.lock, dang xu ly...
    rem Thu doi ten truoc (move thuong hoat dong khi del khong duoc)
    move /Y "%LOCK%" "%LOCK_BAK%" >nul 2>&1
    if exist "%LOCK%" (
        echo     move that bai, thu PowerShell...
        powershell -NoProfile -Command "Remove-Item -Force -LiteralPath (Join-Path (Get-Location) '.git\index.lock') -ErrorAction SilentlyContinue"
    )
    if exist "%LOCK%" (
        echo THAT BAI: Khong the xu ly index.lock
        echo Hay tat VS Code / Git GUI roi thu lai.
        pause
        exit /b 1
    )
    echo OK: index.lock da duoc xu ly.
) else (
    echo [1] Khong co index.lock - binh thuong.
)

echo.
echo [2] Chay deploy...
echo.
npm run deploy:update

echo.
pause
