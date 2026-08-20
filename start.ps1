# PowerShell Launcher for Bakalia BulletGym
Write-Host "===================================================================" -ForegroundColor Red
Write-Host "          BAKALIA BULLETGYM - POWERSHELL INITIALIZER               " -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Red

$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force -ErrorAction SilentlyContinue

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/3] Launching Backend REST API on http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; cd '$ScriptDir\backend'; npm.cmd run dev"

Start-Sleep -Seconds 3

Write-Host "[2/3] Launching Frontend Next.js Dashboard on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; cd '$ScriptDir\frontend'; npm.cmd run dev"

Start-Sleep -Seconds 4

Write-Host "[3/3] Opening Browser at http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`nBakalia BulletGym is running!" -ForegroundColor Cyan
Write-Host "- Web App: http://localhost:3000" -ForegroundColor White
Write-Host "- Swagger Docs: http://localhost:5000/api/docs" -ForegroundColor White
