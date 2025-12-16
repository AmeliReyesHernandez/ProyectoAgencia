# Script de Verificación de Instalación
# Sistema de Gestión de Agencia

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VERIFICACIÓN DE INSTALACIÓN" -ForegroundColor Cyan
Write-Host "   Sistema de Gestión de Agencia" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errores = 0
$advertencias = 0

# 1. Verificar Node.js
Write-Host "[1/7] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "  ✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Node.js NO encontrado" -ForegroundColor Red
        Write-Host "    Descarga desde: https://nodejs.org/" -ForegroundColor Gray
        $errores++
    }
} catch {
    Write-Host "  ✗ Node.js NO encontrado" -ForegroundColor Red
    $errores++
}

# 2. Verificar npm
Write-Host "[2/7] Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "  ✓ npm instalado: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "  ✗ npm NO encontrado" -ForegroundColor Red
        $errores++
    }
} catch {
    Write-Host "  ✗ npm NO encontrado" -ForegroundColor Red
    $errores++
}

# 3. Verificar MySQL
Write-Host "[3/7] Verificando MySQL..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version 2>$null
    if ($mysqlVersion) {
        Write-Host "  ✓ MySQL instalado: $mysqlVersion" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ MySQL no encontrado en PATH" -ForegroundColor Yellow
        Write-Host "    Verifica que MySQL esté instalado" -ForegroundColor Gray
        $advertencias++
    }
} catch {
    Write-Host "  ⚠ MySQL no encontrado en PATH" -ForegroundColor Yellow
    $advertencias++
}

# 4. Verificar estructura de carpetas
Write-Host "[4/7] Verificando estructura del proyecto..." -ForegroundColor Yellow
$requiredFolders = @("backend", "frontend", "database")
$missingFolders = @()

foreach ($folder in $requiredFolders) {
    if (Test-Path $folder) {
        Write-Host "  ✓ Carpeta '$folder' encontrada" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Carpeta '$folder' NO encontrada" -ForegroundColor Red
        $missingFolders += $folder
        $errores++
    }
}

# 5. Verificar dependencias del backend
Write-Host "[5/7] Verificando dependencias del backend..." -ForegroundColor Yellow
if (Test-Path "backend/node_modules") {
    Write-Host "  ✓ Dependencias del backend instaladas" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Dependencias del backend NO instaladas" -ForegroundColor Yellow
    Write-Host "    Ejecuta: cd backend && npm install" -ForegroundColor Gray
    $advertencias++
}

if (Test-Path "backend/package.json") {
    $backendPkg = Get-Content "backend/package.json" -Raw | ConvertFrom-Json
    $requiredDeps = @("express", "cors", "mysql2", "bcrypt")
    foreach ($dep in $requiredDeps) {
        if ($backendPkg.dependencies.$dep) {
            Write-Host "  ✓ Dependencia '$dep' configurada" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Dependencia '$dep' faltante en package.json" -ForegroundColor Red
            $errores++
        }
    }
}

# 6. Verificar dependencias del frontend
Write-Host "[6/7] Verificando dependencias del frontend..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Write-Host "  ✓ Dependencias del frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Dependencias del frontend NO instaladas" -ForegroundColor Yellow
    Write-Host "    Ejecuta: cd frontend && npm install" -ForegroundColor Gray
    $advertencias++
}

# 7. Verificar archivos de base de datos
Write-Host "[7/7] Verificando scripts de base de datos..." -ForegroundColor Yellow
$sqlFiles = @("schema.sql", "login_schema.sql")
foreach ($file in $sqlFiles) {
    if (Test-Path "database/$file") {
        Write-Host "  ✓ Script '$file' encontrado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Script '$file' NO encontrado" -ForegroundColor Red
        $errores++
    }
}

# Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errores -eq 0 -and $advertencias -eq 0) {
    Write-Host ""
    Write-Host "✓ TODO EN ORDEN - El proyecto está listo para ejecutarse" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Configura la base de datos (ver GUIA_INSTALACION.md)" -ForegroundColor White
    Write-Host "  2. Ejecuta el backend: cd backend && npm start" -ForegroundColor White
    Write-Host "  3. Ejecuta el frontend: cd frontend && npm run dev" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Errores: $errores | Advertencias: $advertencias" -ForegroundColor $(if ($errores -gt 0) { "Red" } else { "Yellow" })
    
    if ($errores -gt 0) {
        Write-Host ""
        Write-Host "⚠ Debes resolver los errores antes de continuar" -ForegroundColor Red
        Write-Host "Consulta la GUIA_INSTALACION.md para más detalles" -ForegroundColor Gray
    }
    
    if ($advertencias -gt 0 -and $errores -eq 0) {
        Write-Host ""
        Write-Host "⚠ Hay advertencias, pero puedes intentar continuar" -ForegroundColor Yellow
        Write-Host "Consulta la GUIA_INSTALACION.md si encuentras problemas" -ForegroundColor Gray
    }
}

Write-Host ""
