# CycloneShield AI - PowerShell Prototype Launcher
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                 CYCLONESHIELD AI - PROTOTYPE LAUNCHER" -ForegroundColor Cyan
Write-Host "          From Cyclone Track to Infrastructure Action" -ForegroundColor DarkCyan
Write-Host "======================================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Start Backend
Write-Host "[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$scriptDir\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload`""

# 2. Start Frontend
Write-Host "[2/3] Starting React Vite Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"cd /d $scriptDir\frontend && npm run dev -- --host 127.0.0.1 --port 5173`""

# 3. Open Browser
Start-Sleep -Seconds 2
Write-Host "[3/3] Opening Browser at http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host "CycloneShield AI Prototype is LIVE!" -ForegroundColor Cyan
