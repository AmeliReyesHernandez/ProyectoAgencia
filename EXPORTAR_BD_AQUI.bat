@echo off
:: Script de Exportacion de Base de Datos
:: Sistema Agencia

echo ===============================================
echo   EXPORTADOR DE BASE DE DATOS
echo ===============================================
echo.

:: Leer configuracion del .env
set DB_NAME=agencia
set DB_USER=root

if exist "backend\.env" (
    echo Leyendo configuracion desde backend\.env...
    for /f "tokens=1,2 delims==" %%a in (backend\.env) do (
        if "%%a"=="DB_NAME" set DB_NAME=%%b
        if "%%a"=="DB_USER" set DB_USER=%%b
    )
)

echo.
echo Configuracion detectada:
echo   Base de datos: %DB_NAME%
echo   Usuario: %DB_USER%
echo.

:: Generar nombre de archivo con fecha
for /f "tokens=1-6 delims=/: " %%a in ("%date% %time%") do (
    set TIMESTAMP=%%c%%b%%a_%%d%%e%%f
)
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=agencia_backup_%TIMESTAMP%.sql

echo Exportando base de datos...
echo Archivo de destino: %BACKUP_FILE%
echo.
echo IMPORTANTE: Ingresa la contrasena de MySQL cuando se solicite
echo.

:: Ejecutar mysqldump
mysqldump -u %DB_USER% -p %DB_NAME% > %BACKUP_FILE% 2>nul

if exist "%BACKUP_FILE%" (
    echo.
    echo ===============================================
    echo   BASE DE DATOS EXPORTADA EXITOSAMENTE
    echo ===============================================
    echo.
    echo Archivo: %BACKUP_FILE%
    for %%A in ("%BACKUP_FILE%") do echo Tamano: %%~zA bytes
    echo.
    echo Lleva este archivo junto con el instalador a la otra laptop
    echo.
) else (
    echo.
    echo ERROR: No se pudo crear el archivo de respaldo
    echo Asegurate de que MySQL este instalado y en el PATH
    echo.
)

pause
