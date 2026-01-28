# Script de Empaquetado Automatizado - Sistema Agencia
# Autor: Ameli Reyes
# Descripción: Este script automatiza todo el proceso de empaquetado

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   📦 EMPAQUETADOR - SISTEMA AGENCIA 📦           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Función para mostrar mensajes
function Write-Step {
    param([string]$Message, [string]$Color = "Yellow")
    Write-Host "▶ $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Paso 1: Verificar Node.js
Write-Step "Verificando Node.js..." "Cyan"
try {
    $nodeVersion = node --version
    Write-Success "Node.js instalado: $nodeVersion"
} catch {
    Write-Error "Node.js no está instalado. Por favor instálalo primero."
    exit 1
}

# Paso 2: Verificar que estamos en la carpeta correcta
Write-Step "Verificando ubicación del proyecto..." "Cyan"
if (!(Test-Path "package.json")) {
    Write-Error "No se encontró package.json. Asegúrate de ejecutar este script desde la raíz del proyecto."
    exit 1
}
Write-Success "Ubicación del proyecto correcta"

# Paso 3: Instalar dependencias principales
Write-Step "Instalando dependencias principales..." "Yellow"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error instalando dependencias principales"
    exit 1
}
Write-Success "Dependencias principales instaladas"

# Paso 4: Instalar dependencias del backend
Write-Step "Instalando dependencias del backend..." "Yellow"
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error instalando dependencias del backend"
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Success "Dependencias del backend instaladas"

# Paso 5: Instalar dependencias del frontend
Write-Step "Instalando dependencias del frontend..." "Yellow"
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error instalando dependencias del frontend"
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Success "Dependencias del frontend instaladas"

# Paso 6: Verificar archivos .env
Write-Step "Verificando archivos de configuración..." "Cyan"
if (!(Test-Path "backend\.env")) {
    Write-Host "⚠ ADVERTENCIA: No se encontró backend\.env" -ForegroundColor Yellow
    Write-Host "  Asegúrate de configurar las credenciales de la base de datos" -ForegroundColor Yellow
}
if (!(Test-Path "frontend\.env")) {
    Write-Host "⚠ ADVERTENCIA: No se encontró frontend\.env" -ForegroundColor Yellow
}

# Paso 7: Compilar frontend
Write-Step "Compilando frontend (esto puede tardar)..." "Yellow"
npm run build:frontend
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error compilando el frontend"
    exit 1
}
Write-Success "Frontend compilado correctamente"

# Verificar que se creó la carpeta dist
if (!(Test-Path "frontend\dist")) {
    Write-Error "No se creó la carpeta frontend\dist"
    exit 1
}
Write-Success "Carpeta frontend\dist creada"

# Paso 8: Limpiar dist anterior si existe
if (Test-Path "dist") {
    Write-Step "Limpiando compilaciones anteriores..." "Cyan"
    Remove-Item -Path "dist" -Recurse -Force
    Write-Success "Limpieza completada"
}

# Paso 9: Crear el instalador
Write-Step "Creando instalador para Windows (esto tardará varios minutos)..." "Yellow"
Write-Host "  Por favor espera... ☕" -ForegroundColor Gray
npm run dist:win
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error creando el instalador"
    exit 1
}
Write-Success "Instalador creado correctamente"

# Paso 10: Mostrar resultados
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✅ EMPAQUETADO COMPLETADO ✅             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📂 Archivos generados en:" -ForegroundColor Cyan
$distPath = Resolve-Path "dist"
Write-Host "   $distPath" -ForegroundColor White
Write-Host ""

# Listar archivos en dist
if (Test-Path "dist") {
    $files = Get-ChildItem "dist" -File
    if ($files.Count -gt 0) {
        Write-Host "📦 Archivos disponibles:" -ForegroundColor Cyan
        foreach ($file in $files) {
            if ($file.Extension -eq ".exe") {
                Write-Host "   ✓ $($file.Name)" -ForegroundColor Green
                $sizeInMB = [math]::Round($file.Length / 1MB, 2)
                Write-Host "     Tamaño: $sizeInMB MB" -ForegroundColor Gray
            }
        }
    }
}

Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Exporta tu base de datos MySQL:" -ForegroundColor White
Write-Host "      mysqldump -u root -p agencia > agencia_backup.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Lleva estos archivos a la otra laptop:" -ForegroundColor White
Write-Host "      • dist\SistemaAgencia Setup 1.0.0.exe" -ForegroundColor Gray
Write-Host "      • agencia_backup.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. En la otra laptop:" -ForegroundColor White
Write-Host "      • Instala MySQL" -ForegroundColor Gray
Write-Host "      • Importa la base de datos" -ForegroundColor Gray
Write-Host "      • Ejecuta el instalador" -ForegroundColor Gray
Write-Host ""

# Preguntar si quiere abrir la carpeta dist
Write-Host "¿Deseas abrir la carpeta dist ahora? (S/N): " -ForegroundColor Cyan -NoNewline
$response = Read-Host
if ($response -eq "S" -or $response -eq "s") {
    explorer "dist"
}

Write-Host ""
Write-Host "¡Proceso completado exitosamente! 🎉" -ForegroundColor Green
Write-Host ""
