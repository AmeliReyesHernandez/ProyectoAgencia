#!/bin/bash
# Script para preparar y compilar Electron en Windows

echo "========================================="
echo "Sistema de Gestión de Agencia - Build"
echo "========================================="
echo ""

echo "[1/5] Verificando Node.js..."
node --version || exit 1
npm --version || exit 1
echo "✓ Node.js disponible"
echo ""

echo "[2/5] Instalando dependencias globales..."
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
echo "✓ Dependencias instaladas"
echo ""

echo "[3/5] Compilando frontend..."
cd frontend
npm run build
if [ ! -d "dist" ]; then
  echo "✗ Error: frontend/dist no existe"
  exit 1
fi
cd ..
echo "✓ Frontend compilado"
echo ""

echo "[4/5] Creando instalador..."
npm run dist:win
if [ ! -d "dist" ]; then
  echo "✗ Error: dist no existe"
  exit 1
fi
echo "✓ Instalador creado"
echo ""

echo "[5/5] Limpieza..."
echo "✓ Completado"
echo ""

echo "========================================="
echo "✓ ¡Compilación exitosa!"
echo "========================================="
echo ""
echo "El ejecutable está en: dist/"
echo ""
ls -lh dist/*.exe 2>/dev/null || echo "Verificar carpeta dist/"
