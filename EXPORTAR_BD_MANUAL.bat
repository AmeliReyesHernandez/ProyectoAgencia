@echo off
:: Script para exportar base de datos buscando MySQL automaticamente
:: Sistema Agencia

echo ===============================================
echo   EXPORTADOR DE BASE DE DATOS v2
echo ===============================================
echo.

:: Buscar MySQL en ubicaciones comunes
set MYSQL_PATH=
set MYSQLDUMP_PATH=

:: Buscar en Program Files
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" (
    set MYSQLDUMP_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    goto :found
)

if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe" (
    set MYSQLDUMP_PATH="C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe"
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
    goto :found
)

if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqldump.exe" (
    set MYSQLDUMP_PATH="C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqldump.exe"
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
    goto :found
)

:: Buscar en Program Files (x86)
if exist "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysqldump.exe" (
    set MYSQLDUMP_PATH="C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
    set MYSQL_PATH="C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
    goto :found
)

:: Buscar en XAMPP
if exist "C:\xampp\mysql\bin\mysqldump.exe" (
    set MYSQLDUMP_PATH="C:\xampp\mysql\bin\mysqldump.exe"
    set MYSQL_PATH="C:\xampp\mysql\bin\mysql.exe"
    goto :found
)

:: Buscar en WAMP
if exist "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysqldump.exe" (
    set MYSQLDUMP_PATH="C:\wamp64\bin\mysql\mysql8.0.31\bin\mysqldump.exe"
    set MYSQL_PATH="C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe"
    goto :found
)

:: No encontrado
echo ERROR: No se pudo encontrar MySQL
echo.
echo Por favor, busca manualmente donde esta instalado MySQL
echo Ubicaciones comunes:
echo   - C:\Program Files\MySQL\
echo   - C:\xampp\mysql\
echo   - C:\wamp64\bin\mysql\
echo.
pause
exit /b 1

:found
echo [OK] MySQL encontrado en: %MYSQL_PATH%
echo.

:: Leer configuracion
set DB_NAME=agencia
set DB_USER=root

if exist "backend\.env" (
    for /f "tokens=1,2 delims==" %%a in (backend\.env) do (
        if "%%a"=="DB_NAME" set DB_NAME=%%b
        if "%%a"=="DB_USER" set DB_USER=%%b
    )
)

echo Configuracion:
echo   Base de datos: %DB_NAME%
echo   Usuario: %DB_USER%
echo.

:: Generar nombre de archivo
for /f "tokens=1-6 delims=/: " %%a in ("%date% %time%") do (
    set TIMESTAMP=%%c%%b%%a_%%d%%e%%f
)
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=agencia_backup_%TIMESTAMP%.sql

echo Exportando base de datos...
echo Archivo: %BACKUP_FILE%
echo.
echo IMPORTANTE: Ingresa tu contrasena de MySQL cuando se solicite
echo.

:: Ejecutar mysqldump con ruta completa
%MYSQLDUMP_PATH% -u %DB_USER% -p %DB_NAME% > %BACKUP_FILE% 2>nul

:: Verificar resultado
if exist "%BACKUP_FILE%" (
    for %%A in ("%BACKUP_FILE%") do set FILE_SIZE=%%~zA
    
    if !FILE_SIZE! EQU 0 (
        echo.
        echo ERROR: El archivo se creo pero esta vacio (0 bytes)
        echo Posibles causas:
        echo   - Contrasena incorrecta
        echo   - La base de datos no existe
        echo   - La base de datos esta vacia
        echo.
        del "%BACKUP_FILE%"
    ) else (
        echo.
        echo ===============================================
        echo   BASE DE DATOS EXPORTADA EXITOSAMENTE
        echo ===============================================
        echo.
        echo Archivo: %BACKUP_FILE%
        echo Tamano: !FILE_SIZE! bytes
        echo.
        echo Lleva este archivo junto con el instalador a la otra laptop
        echo.
    )
) else (
    echo.
    echo ERROR: No se pudo crear el archivo de respaldo
    echo Verifica tu contrasena de MySQL
    echo.
)

pause
