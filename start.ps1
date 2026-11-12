# Cupiddle All-in-One Startup Script

Write-Host "========================================================" -ForegroundColor Magenta
Write-Host "   CUPIDDLE — Curiosity-First Social Discovery" -ForegroundColor Magenta
Write-Host "   Philosophy: Curiosity is attractive." -ForegroundColor White
Write-Host "   Commercial Model: 100% Free (No Paywalls)" -ForegroundColor Green
Write-Host "   Coverage: Nationwide Nigeria" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Magenta

# 1. Start Go Low-Latency Server
Write-Host "`n[1/3] Starting Go Server on http://localhost:8080..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd server; ./server.exe"

Start-Sleep -Seconds 2

# 2. Start Web Client (PWA)
Write-Host "[2/3] Starting Web Discovery Portal on http://localhost:3000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd web; npm run dev"

Start-Sleep -Seconds 1

# 3. Start Admin Console
Write-Host "[3/3] Starting Staff & Moderation Console on http://localhost:3001..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd admin; npm run dev"

Write-Host "`nAll Cupiddle servers launched successfully!" -ForegroundColor Green
Write-Host "  - Web App (PWA Mobile/Desktop): http://localhost:3000" -ForegroundColor White
Write-Host "  - Staff Console:                http://localhost:3001 (admin@cupiddle.com / CupiddleAdmin2026!)" -ForegroundColor White
Write-Host "  - Go Low-Latency API:           http://localhost:8080" -ForegroundColor White
