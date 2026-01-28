# Script para Exportar Base de Datos MySQL
# Sistema Agencia

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🗄️  EXPORTADOR DE BASE DE DATOS  🗄️            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Leer configuración del .env del backend
$envFile = "backend\.env"
$dbName = "agencia"
$dbUser = "root"
$dbHost = "localhost"

if (Test-Path $envFile) {
    Write-Host "✓ Leyendo configuración desde backend\.env..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^DB_NAME=(.+)$") { $dbName = $matches[1] }
        if ($_ -match "^DB_USER=(.+)$") { $dbUser = $matches[1] }
        if ($_ -match "^DB_HOST=(.+)$") { $dbHost = $matches[1] }
    }
} else {
    Write-Host "⚠ No se encontró backend\.env, usando valores por defecto" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Configuración detectada:" -ForegroundColor Cyan
Write-Host "  Base de datos: $dbName" -ForegroundColor White
Write-Host "  Usuario: $dbUser" -ForegroundColor White
Write-Host "  Host: $dbHost" -ForegroundColor White
Write-Host ""

# Nombre del archivo de respaldo
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "agencia_backup_$timestamp.sql"

Write-Host "Exportando base de datos..." -ForegroundColor Yellow
Write-Host "Archivo de destino: $backupFile" -ForegroundColor Gray
Write-Host ""
Write-Host "Ingresa la contraseña de MySQL cuando se solicite:" -ForegroundColor Cyan

# Ejecutar mysqldump
try {
    mysqldump -u $dbUser -p --host=$dbHost $dbName > $backupFile
    
    if (Test-Path $backupFile) {
        $fileSize = (Get-Item $backupFile).Length / 1KB
        Write-Host ""
        Write-Host "✅ Base de datos exportada exitosamente" -ForegroundColor Green
        Write-Host "   Archivo: $backupFile" -ForegroundColor White
        Write-Host "   Tamaño: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Lleva este archivo junto con el instalador a la otra laptop." -ForegroundColor Cyan
    } else {
        Write-Host "✗ Error: No se pudo crear el archivo de respaldo" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error ejecutando mysqldump" -ForegroundColor Red
    Write-Host "  Asegúrate de que MySQL esté instalado y en el PATH" -ForegroundColor Yellow
    Write-Host "  Error: $_" -ForegroundColor Red
}

Write-Host ""
