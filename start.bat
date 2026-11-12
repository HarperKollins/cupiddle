@echo off
echo ========================================================
echo    CUPIDDLE — Curiosity-First Social Discovery
echo    Philosophy: Curiosity is attractive.
echo    Commercial Model: 100%% Free (No Paywalls)
echo ========================================================
echo.
echo Starting Go Low-Latency API Server (Port 8080)...
start "Cupiddle Server" cmd /k "cd server && server.exe"

timeout /t 2 /nobreak >nul

echo Starting Web Discovery Client (Port 3000)...
start "Cupiddle Web" cmd /k "cd web && npm run dev"

timeout /t 1 /nobreak >nul

echo Starting Admin & Moderation Console (Port 3001)...
start "Cupiddle Admin" cmd /k "cd admin && npm run dev"

echo.
echo ========================================================
echo All services launched:
echo   - Web App (PWA Mobile/Desktop): http://localhost:3000
echo   - Admin & Moderation Console:   http://localhost:3001
echo   - Go Backend REST & WebSockets: http://localhost:8080
echo ========================================================

