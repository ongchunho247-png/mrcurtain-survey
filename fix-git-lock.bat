@echo off
chcp 65001 >nul
echo ============================================
echo   Xoa git index.lock va chay deploy
echo ============================================
echo.

set LOCK_FILE=.git\index.lock

if exist "%LOCK_FILE%" (
    echo [1] Tim thay file khoa: %LOCK_FILE%
    del /F /Q "%LOCK_FILE%"
    if exist "%LOCK_FILE%" (
        echo THAT BAI: Khong the xoa file khoa.
        echo Hay thu chay PowerShell voi quyen Administrator.
        pause
        exit /b 1
    ) else (
        echo OK: Da xoa file khoa thanh cong.
    )
) else (
    echo [1] Khong co file khoa - binh thuong.
)

echo.
echo [2] Chay npm run deploy:update...
echo.
npm run deploy:update

echo.
pause
