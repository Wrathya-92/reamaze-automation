# Reamaze CX Automation - Windows Start Script
# Ensures Ollama is running, then starts the server

Write-Host "Starting Reamaze CX Automation..." -ForegroundColor Cyan

# Ensure Ollama is running
try {
    Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 | Out-Null
} catch {
    Write-Host "Starting Ollama service..." -ForegroundColor Yellow
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

& npm start
