@echo off
cd /d "%~dp0"
echo Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo Push failed! Retrying...
    git push origin main --force-with-lease
)
echo Done!
pause
