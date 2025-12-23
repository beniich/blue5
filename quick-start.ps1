# Quick Start Script for Dash1cc Applications
# Usage: .\quick-start.ps1

Write-Host " Quick Start - Dash1cc Applications" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host " Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  Node.js is not installed. Please install it first." -ForegroundColor Yellow
    exit 1
}

Write-Host "
 Installing dependencies if needed..." -ForegroundColor Blue

# School 1cc
Write-Host "
 Setting up School 1cc..." -ForegroundColor Green
Set-Location "school-1cc"
if (-Not (Test-Path "node_modules")) {
    npm install
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

# CRM Pro.cc  
Write-Host "
 Setting up CRM Pro.cc..." -ForegroundColor Green
Set-Location "../crm-pro"
if (-Not (Test-Path "node_modules")) {
    npm install
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Set-Location ".."

Write-Host "
 Applications started successfully!" -ForegroundColor Green
Write-Host "
 School 1cc:    http://localhost:5173" -ForegroundColor Blue
Write-Host " CRM Pro.cc:    http://localhost:5174" -ForegroundColor Blue
Write-Host "
Two PowerShell windows have been opened. Close them to stop the applications." -ForegroundColor Yellow
