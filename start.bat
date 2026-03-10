@echo off
REM HabboRetro - Start Script for Windows
REM Prerequisites: Java 17+, Python 3.10+, Poetry, MySQL 8.0+

echo =========================================
echo   HabboRetro - Starting All Services
echo =========================================

set SCRIPT_DIR=%~dp0

REM 1. Fix MySQL sql_mode
echo [1/3] Fixing MySQL sql_mode...
REM Update DB_USER and DB_PASS if you changed them in arcturus-server/config.ini
set DB_USER=arcturus
set /p DB_PASS=Enter MySQL password for user '%DB_USER%': 
mysql -u %DB_USER% -p%DB_PASS% -e "SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));" 2>nul
echo MySQL sql_mode fixed

REM 2. Start Arcturus Morningstar
echo [2/3] Starting Arcturus Morningstar...
cd /d "%SCRIPT_DIR%arcturus-server"
start "Arcturus" java -jar Arcturus.jar
timeout /t 5 /nobreak >nul
echo Arcturus started (Game: 3000, WS: 2096)

REM 3. Start CMS Backend
echo [3/3] Starting CMS Backend...
cd /d "%SCRIPT_DIR%habbo-backend"
start "HabboBackend" poetry run fastapi dev app/main.py --port 8000 --host 0.0.0.0
timeout /t 3 /nobreak >nul

echo.
echo =========================================
echo   HabboRetro is now running!
echo =========================================
echo.
echo   CMS ^& Hotel:   http://localhost:8000
echo   Nitro Client:   http://localhost:8000/client
echo   Arcturus WS:    ws://localhost:2096
echo.
echo   Test Account: TestPlayer / password123
echo   Credits: 50,000 ^| Pixels: 50,000 ^| Diamonds: 50,000
echo.
echo   To stop: Close the Arcturus and HabboBackend windows
echo =========================================
pause
