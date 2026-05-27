@echo off
chcp 65001 >nul
echo ============================================
echo   Fix tat ca git lock va deploy
echo ============================================
echo.

cd /d "%~dp0"

rem --- Danh sach cac lock file can xu ly ---
set LOCKS=.git\index.lock .git\HEAD.lock .git\objects\maintenance.lock .git\MERGE_HEAD.lock .git\CHERRY_PICK_HEAD.lock

echo [1] Kiem tra va xoa cac git lock file...
for %%L in (%LOCKS%) do (
    if exist "%%L" (
        echo     Tim thay %%L, dang xu ly...
        rem Thu move (hoat dong khi del khong duoc do mount)
        move /Y "%%L" "%%L.bak" >nul 2>&1
        if exist "%%L" (
            rem Thu PowerShell neu move that bai
            powershell -NoProfile -Command "Remove-Item -Force -LiteralPath (Join-Path '%CD%' '%%L') -ErrorAction SilentlyContinue" >nul 2>&1
        )
        if exist "%%L" (
            echo     CANH BAO: Khong the xoa %%L - bo qua.
        ) else (
            echo     OK: %%L da duoc xu ly.
        )
    )
)
rem Xoa cac file .bak vua tao
for %%L in (%LOCKS%) do (
    if exist "%%L.bak" del /F /Q "%%L.bak" >nul 2>&1
)

echo.
echo [2] Chay deploy...
echo.
npm run deploy:update

echo.
pause
