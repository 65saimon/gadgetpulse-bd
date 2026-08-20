@echo off
TITLE Bakalia BulletGym - Launcher
COLOR 0C

echo ===================================================================
echo             BAKALIA BULLETGYM - SYSTEM INITIALIZER
echo                   "Forged in Iron. Built for Greatness."
echo ===================================================================
echo.

:: Ensure Node.js is in PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

cd /d "%~dp0"

echo [1/3] Checking Node.js and NPM availability...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH or standard location.
    pause
    exit /b
)

echo [2/3] Launching Backend REST API Server on http://localhost:5000...
start "BulletGym Backend API" cmd /k "cd /d "%~dp0backend" && set PATH=C:\Program Files\nodejs;%%PATH%% && npm.cmd run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Launching Frontend Next.js Dashboard on http://localhost:3000...
start "BulletGym Frontend Web App" cmd /k "cd /d "%~dp0frontend" && set PATH=C:\Program Files\nodejs;%%PATH%% && npm.cmd run dev"

timeout /t 4 /nobreak >nul

echo.
echo ===================================================================
echo   Bakalia BulletGym is now running!
echo.
echo   - Web Application: http://localhost:3000
echo   - Swagger API Docs: http://localhost:5000/api/docs
echo.
echo   Demo Logins:
echo     Admin:       admin / bulletAdmin123!
echo     Trainer:     trainer / trainerPass123!
echo     Reception:   reception / receptionPass123!
echo     Member:      member / memberPass123!
echo ===================================================================
echo.
echo Opening browser...
start http://localhost:3000

echo Done. You can keep this window open or close it.
pause
