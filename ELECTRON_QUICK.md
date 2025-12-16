# RESUMEN: Cómo Empaquetar con Electron

## 📋 Requisitos
- [x] Node.js v16+ instalado
- [x] MySQL corriendo
- [x] Dependencias instaladas
- [x] Variables `.env` configuradas

## 🔨 Pasos Rápidos para Compilar

### Para Windows (lo más común):

```bash
# 1. Navegar a la carpeta del proyecto
cd C:\Users\Usuario\Documents\SistemaAgencia

# 2. Compilar frontend
npm run build:frontend

# 3. Crear el instalador
npm run dist:win
```

**El ejecutable estará en:** `SistemaAgencia/dist/`

### Resultado:
- ✅ `SistemaAgencia Setup 1.0.0.exe` - Instalador (recomendado para cliente)
- ✅ `SistemaAgencia 1.0.0.exe` - Versión portable (sin instalación)

---

## 📦 Qué Incluye el Ejecutable

El `.exe` incluye:
```
✓ Backend (API Node.js)
✓ Frontend (Aplicación Vue)
✓ Base de Datos (referencias)
✓ Todas las dependencias
```

El cliente **NO necesita instalar:**
- Node.js
- npm
- Git
- Nada más

Solo necesita:
- MySQL corriendo (con BD agencia configurada)

---

## 🚀 Para el Cliente

1. **Descargar el instalador:** `SistemaAgencia Setup 1.0.0.exe`
2. **Ejecutar el instalador** (siguiente, siguiente, finalizar)
3. **Se crea acceso directo en escritorio**
4. **Hacer doble clic para iniciar**

**¡Listo!** La aplicación se abre y funciona.

---

## 🛠️ Scripts de Ayuda

### Script PowerShell (Recomendado para Windows)
```powershell
# Ejecutar como administrador
.\build.ps1
```

### Script Bash (Para Linux/macOS)
```bash
chmod +x build.sh
./build.sh
```

---

## 📁 Estructura Final

Después de compilar:
```
SistemaAgencia/
├── dist/
│   ├── SistemaAgencia Setup 1.0.0.exe  ← ¡ESTO es lo que das al cliente!
│   ├── SistemaAgencia 1.0.0.exe
│   └── resources/
│       ├── app.asar (contiene todo)
│       └── ...
├── frontend/
│   └── dist/
├── backend/
│   └── ...
└── ...
```

---

## 🔧 Personalización

### Cambiar nombre de la aplicación:
Edit `package.json`:
```json
{
  "name": "sistemaagencia",
  "productName": "Mi Nombre De App",
  "version": "1.0.0"
}
```

### Cambiar icono:
1. Crear icono (`icon.png` 512x512)
2. Agregar en `package.json`:
```json
"build": {
  "win": {
    "icon": "assets/icon.png"
  }
}
```

### Cambiar URL de BD:
Edit `backend/.env`:
```env
DB_HOST=ip.del.servidor
DB_USER=usuario
DB_PASSWORD=contraseña
```

---

## ✅ Checklist Antes de Entregar

- [ ] Cambiar contraseña de admin
- [ ] Verificar variables `.env`
- [ ] Compilar frontend
- [ ] Probar el `.exe` en tu máquina
- [ ] Verificar que conecta a BD correctamente
- [ ] Compartir `SistemaAgencia Setup 1.0.0.exe` con cliente

---

## 📞 Soporte

Si al cliente le salen errores:

| Error | Solución |
|-------|----------|
| "Cannot connect to database" | Verificar MySQL y credenciales en .env |
| "Port 4000 already in use" | Cambiar PORT en backend/.env |
| "Cannot find module" | Reinstalar el app completo |

---

## 🎉 ¡Listo!

Tu aplicación está empaquetada como ejecutable profesional.

El cliente solo necesita:
- Descargar el `.exe`
- Instalarlo
- ¡Usarlo!

No necesita saber de:
- Node.js
- npm
- Terminal
- Código

**¡Es una verdadera aplicación de escritorio!** 🚀
