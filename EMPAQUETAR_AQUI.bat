@echo off
:: Script de Empaquetado - Sistema Agencia
:: Este archivo .bat funciona sin restricciones de PowerShell

echo ===============================================
echo   EMPAQUETADOR - SISTEMA AGENCIA
echo ===============================================
echo.

:: Verificar Node.js
echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js instalado
echo.

:: Instalar dependencias principales
echo Instalando dependencias principales...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias principales
    pause
    exit /b 1
)
echo [OK] Dependencias principales instaladas
echo.

:: Instalar dependencias del backend
echo Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias del backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Dependencias del backend instaladas
echo.

:: Instalar dependencias del frontend
echo Instalando dependencias del frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias del frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Dependencias del frontend instaladas
echo.

:: Compilar frontend
echo Compilando frontend (esto puede tardar)...
call npm run build:frontend
if %errorlevel% neq 0 (
    echo ERROR: No se pudo compilar el frontend
    pause
    exit /b 1
)
echo [OK] Frontend compilado
echo.

:: Crear instalador
echo Creando instalador para Windows (esto tardara varios minutos)...
echo Por favor espera...
call npm run dist:win
if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear el instalador
    pause
    exit /b 1
)
echo.

:: Mostrar resultados
echo ===============================================
echo   EMPAQUETADO COMPLETADO EXITOSAMENTE
echo ===============================================
echo.
echo Archivos generados en: %CD%\dist
echo.

if exist "dist" (
    echo Archivos disponibles:
    dir /b "dist\*.exe"
    echo.
)

echo Proximos pasos:
echo 1. Exporta tu base de datos con: EXPORTAR_BD_AQUI.bat
echo 2. Lleva el instalador .exe a la otra laptop
echo 3. Lleva tambien el archivo .sql de la base de datos
echo.
echo Quieres abrir la carpeta dist? (S/N)
set /p respuesta="> "
if /i "%respuesta%"=="S" (
    explorer dist
)

echo.
echo Proceso completado!
pause
