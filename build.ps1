# Script para preparar y compilar Electron en Windows

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Sistema de Gestión de Agencia - Build" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow
try {
    node --version
    npm --version
    Write-Host "✓ Node.js disponible" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[2/5] Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

Push-Location backend
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }
Pop-Location

Push-Location frontend
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }
Pop-Location

Write-Host "✓ Dependencias instaladas" -ForegroundColor Green
Write-Host ""

Write-Host "[3/5] Compilando frontend..." -ForegroundColor Yellow
Push-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error compilando frontend" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "dist")) {
    Write-Host "✗ Error: frontend/dist no existe" -ForegroundColor Red
    exit 1
}
Pop-Location
Write-Host "✓ Frontend compilado" -ForegroundColor Green
Write-Host ""

Write-Host "[4/5] Creando instalador..." -ForegroundColor Yellow
npm run dist:win
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error creando instalador" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "dist")) {
    Write-Host "✗ Error: dist no existe" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Instalador creado" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✓ ¡Compilación exitosa!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "El ejecutable está en: dist/" -ForegroundColor Cyan
Write-Host ""

Get-ChildItem "dist\" -Filter "*.exe" | ForEach-Object {
    Write-Host "📦 $($_.Name) - $([Math]::Round($_.Length / 1MB, 2)) MB"
}

Write-Host ""
Write-Host "Pasos siguientes:" -ForegroundColor Cyan
Write-Host "1. Probar el ejecutable: dist\SistemaAgencia Setup 1.0.0.exe"
Write-Host "2. Compartir con el cliente" -ForegroundColor Green
