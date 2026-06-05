@echo off
chcp 65001 >nul
echo ============================================
echo   Git Push — day commit len GitHub
echo ============================================
echo.
cd /d "%~dp0"

echo [1] Kiem tra trang thai...
git status --short
echo.

echo [2] Push len GitHub...
git push
echo.

if %ERRORLEVEL% EQU 0 (
  echo THANH CONG: Da push len GitHub.
) else (
  echo THAT BAI: Kiem tra ket noi internet hoac credentials.
)
echo.
pause
