# Reamaze CX Automation - Windows Setup Script
# Run as: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Reamaze CX Automation - Windows Setup      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# 1. Check/Install Ollama
Write-Host "[1/6] Checking Ollama..." -ForegroundColor Yellow
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-Host "       Ollama already installed ✓" -ForegroundColor Green
} else {
    Write-Host "       Installing Ollama..." -ForegroundColor Yellow
    $ollamaInstaller = "$env:TEMP\OllamaSetup.exe"
    Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile $ollamaInstaller
    Start-Process -FilePath $ollamaInstaller -Args "/S" -Wait
    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Ollama installed but not in PATH. Please restart this terminal and re-run setup." -ForegroundColor Red
        exit 1
    }
    Write-Host "       Ollama installed ✓" -ForegroundColor Green
}

# 2. Check if Ollama is running
Write-Host "[2/6] Checking Ollama service..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 | Out-Null
    Write-Host "       Ollama service running ✓" -ForegroundColor Green
} catch {
    Write-Host "       Starting Ollama service..." -ForegroundColor Yellow
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "       Ollama service started ✓" -ForegroundColor Green
}

# 3. Pull model
$model = if ($env:OLLAMA_TIER1_MODEL) { $env:OLLAMA_TIER1_MODEL } else { "mistral" }
Write-Host "[3/6] Pulling model: $model (may take a few minutes on first run)..." -ForegroundColor Yellow
& ollama pull $model

# 4. Check/Install Node.js
Write-Host "[4/6] Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = & node -v
    Write-Host "       Node.js already installed ✓ ($nodeVersion)" -ForegroundColor Green
} else {
    Write-Host "       Installing Node.js via winget..." -ForegroundColor Yellow
    & winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Node.js installed but not in PATH. Please restart this terminal and re-run setup." -ForegroundColor Red
        exit 1
    }
    Write-Host "       Node.js installed ✓" -ForegroundColor Green
}

# 5. Install deps and build
Write-Host "[5/6] Installing dependencies and building..." -ForegroundColor Yellow
& npm install
& npm run build

# 6. Create .env if needed
Write-Host "[6/6] Checking .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "⚠️  Created .env from .env.example" -ForegroundColor Yellow
    Write-Host "   Please edit .env with your Reamaze credentials:" -ForegroundColor Yellow
    Write-Host "   - REAMAZE_API_TOKEN" -ForegroundColor White
    Write-Host "   - REAMAZE_BRAND" -ForegroundColor White
    Write-Host "   - REAMAZE_EMAIL" -ForegroundColor White
} else {
    Write-Host "       .env already exists ✓" -ForegroundColor Green
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Setup complete!                             ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║   Start with:  npm start                      ║" -ForegroundColor Green
Write-Host "║   Dev mode:    npm run dev                     ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
