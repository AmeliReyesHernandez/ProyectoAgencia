# Guía de Electron - Sistema de Gestión de Agencia

## ¿Qué es Electron?
Electron es un framework que permite empaquetar aplicaciones web como aplicaciones de escritorio (.exe en Windows, .dmg en macOS, .AppImage en Linux).

## Estructura del Proyecto con Electron

```
SistemaAgencia/
├── backend/                    # API Node.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/                   # Aplicación Vue 3
│   ├── src/
│   ├── package.json
│   └── .env
├── electron-main.js            # Entrada de Electron
├── preload.js                  # Seguridad entre contextos
├── package.json                # Configuración principal
└── ELECTRON.md                 # Este archivo
```

## Pasos para Compilar a Electron

### 1. Preparar el Ambiente

```bash
# Instalar todas las dependencias
npm install

# Instalar dependencias del backend
cd backend && npm install && cd ..

# Instalar dependencias del frontend
cd frontend && npm install && cd ..
```

### 2. Verificar Variables de Entorno

**backend/.env:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1312
DB_NAME=agencia
DB_PORT=3306
PORT=4000
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Compilar Frontend

```bash
npm run build:frontend
```

Esto crea la carpeta `frontend/dist/` con los archivos optimizados.

### 4. Empaquetar para Electron

#### Opción A: Solo crear el ejecutable (sin instalador)
```bash
npm run pack
```

#### Opción B: Crear ejecutable + instalador (recomendado)
```bash
npm run dist
```

#### Opción C: Por sistema operativo específico
```bash
# Solo Windows
npm run dist:win

# Solo macOS
npm run dist:mac

# Solo Linux
npm run dist:linux
```

### 5. Localizar el Ejecutable

Los archivos compilados se encontrarán en:
```
SistemaAgencia/dist/
├── SistemaAgencia Setup 1.0.0.exe  (Windows - Instalador)
├── SistemaAgencia 1.0.0.exe        (Windows - Portable)
└── builder-effective-config.yaml
```

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Ejecutar en modo desarrollo (frontend + backend + Electron) |
| `npm run dev:frontend` | Solo ejecutar frontend |
| `npm run dev:backend` | Solo ejecutar backend |
| `npm run dev:electron` | Solo ejecutar Electron |
| `npm run build:frontend` | Compilar frontend para producción |
| `npm run pack` | Crear ejecutable sin instalador |
| `npm run dist` | Crear ejecutable + instalador (todas las plataformas) |
| `npm run dist:win` | Crear instalador solo para Windows |
| `npm run dist:mac` | Crear instalador solo para macOS |
| `npm run dist:linux` | Crear instalador solo para Linux |

## Configuración de Electron (electron-builder)

El archivo `package.json` contiene la configuración de `electron-builder`:

```json
"build": {
  "appId": "com.agencia.sistema",
  "productName": "SistemaAgencia",
  "files": [
    "backend/**/*",
    "frontend/dist/**/*",
    "electron-main.js",
    "preload.js",
    "node_modules/**/*"
  ],
  "win": {
    "signAndEditExecutable": false
  }
}
```

### Personalizar la Compilación

Para cambiar:
- Nombre de la aplicación: Cambiar `productName`
- ID de la aplicación: Cambiar `appId`
- Icono: Agregar `"icon": "assets/icon.png"` en `build.win`
- Información: Editar `name`, `version`, `author` en `package.json`

## Flujo de Ejecución

### En Desarrollo:
1. **electron-main.js** inicia
2. Backend (Node.js) se ejecuta en puerto 4000
3. Frontend (Vite) se ejecuta en puerto 5173
4. Electron carga `http://localhost:5173`

### En Producción:
1. **electron-main.js** inicia
2. Backend (Node.js) se ejecuta en puerto 4000
3. Electron carga desde `frontend/dist/index.html`

## Posibles Problemas

### Error: "backend not found"
- Asegurar que la carpeta `backend/` exista con `server.js`
- Verificar que Node.js está instalado

### Error: "port 4000 already in use"
- Cambiar PORT en `.env` del backend
- O: `netstat -ano | findstr :4000` para ver qué usa el puerto

### Error: "Cannot find module 'dotenv'"
```bash
cd backend && npm install dotenv
```

### Error: "Frontend files not found"
- Ejecutar `npm run build:frontend` antes de `npm run dist`
- Verificar que existe `frontend/dist/`

## Distribución al Cliente

### Opción 1: Instalador Windows (.exe)
```bash
npm run dist:win
# Compartir: dist/SistemaAgencia Setup 1.0.0.exe
```

### Opción 2: Portable (sin instalación)
Ya está en la carpeta `dist/` como `SistemaAgencia 1.0.0.exe`

### Opción 3: Instalador Multi-plataforma
```bash
npm run dist
# Crea instaladores para Windows, macOS y Linux
```

## Ejemplo de Instalación para el Cliente

1. **Recibir el archivo ejecutable** (ej: `SistemaAgencia Setup 1.0.0.exe`)
2. **Ejecutar el instalador** (siguiente, siguiente, finalizar)
3. **Se crea atajo en el escritorio**
4. **Hacer doble clic para iniciar**

¡La aplicación incluye todo (backend, frontend, base de datos) en un solo instalador!

## Notas Importantes

- ✅ El backend se inicia automáticamente
- ✅ No requiere Node.js instalado en la máquina del cliente
- ✅ La BD debe estar en el servidor especificado en `.env`
- ✅ CORS se configura automáticamente
- ⚠️ Cambiar credenciales de BD para producción
- ⚠️ Usar HTTPS en producción
- ⚠️ Mantener `.env` seguro (no incluir en repositorio)
