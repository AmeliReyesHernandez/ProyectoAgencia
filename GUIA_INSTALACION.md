# 📘 Guía de Instalación - Sistema de Gestión de Agencia

Esta guía te permitirá configurar y ejecutar el proyecto desde cero en cualquier equipo.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### Software Requerido
1. **Node.js 16+**
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **MySQL 8.0+**
   - Descargar desde: https://dev.mysql.com/downloads/installer/
   - Verificar instalación: `mysql --version`

3. **Git** (opcional, para clonar el repositorio)
   - Descargar desde: https://git-scm.com/

---

## 🔧 Pasos de Instalación

### 1️⃣ Configurar la Base de Datos MySQL

#### A. Iniciar MySQL
```bash
# Asegúrate de que el servidor MySQL esté corriendo
# En Windows, puedes verificar en Servicios o iniciar desde MySQL Workbench
```

#### B. Crear Base de Datos y Tablas

1. Abre **MySQL Workbench** o conecta por terminal:
   ```bash
   mysql -u root -p
   ```

2. Ejecuta el script de la base de datos:
   ```sql
   -- Cambia la contraseña si es necesario
   USE mysql;
   
   -- Crear la base de datos llamada 'agencia'
   CREATE DATABASE IF NOT EXISTS agencia;
   USE agencia;
   ```

3. **IMPORTANTE**: Ejecuta los siguientes scripts en orden:

   **a) Primero ejecutar `database/schema.sql`** 
   - Este crea las tablas: `personas`, `aportaciones`, `cargos`, `estatus`
   
   **b) Luego ejecutar `database/login_schema.sql`**
   - Este crea la tabla `usuarios` con el usuario admin por defecto
   
   **c) Si es necesario, ejecutar `database/fix_password.sql`**
   - Este actualiza la contraseña del admin si hay problemas

#### C. Verificar que las tablas existen
```sql
USE agencia;
SHOW TABLES;

-- Deberías ver:
-- personas
-- aportaciones
-- cargos
-- estatus
-- usuarios
```

#### D. Configurar usuario y contraseña de MySQL

Toma nota de lo siguiente porque lo necesitarás para el backend:
- **Host**: `localhost`
- **Usuario**: `root` (o tu usuario de MySQL)
- **Contraseña**: La que configuraste al instalar MySQL
- **Puerto**: `3306` (por defecto)
- **Base de datos**: `agencia`

---

### 2️⃣ Configurar el Backend

#### A. Instalar dependencias del backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar todas las dependencias
npm install
```

Esto instalará:
- `express` - Framework web
- `cors` - Manejo de CORS
- `mysql2` - Cliente MySQL
- `bcrypt` - Encriptación de contraseñas

#### B. Configurar la conexión a la base de datos

Abre el archivo `backend/server.js` y verifica/edita la configuración en las **líneas 10-16**:

```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',              // ⚠️ Cambiar si usas otro usuario
  password: '1234',          // ⚠️ CAMBIAR por tu contraseña de MySQL
  database: 'agencia',       // ⚠️ Debe coincidir con la BD creada
  port: 3306
};
```

**⚠️ IMPORTANTE**: Si usas una contraseña diferente o un usuario diferente, debes cambiar estos valores.

#### C. Verificar el puerto del backend

El backend corre en el puerto `4000` por defecto (ver línea 477 de `server.js`).

Si necesitas cambiar el puerto, puedes editar:
```javascript
const PORT = process.env.BACKEND_PORT || 4000;
```

---

### 3️⃣ Configurar el Frontend

#### A. Instalar dependencias del frontend

```bash
# Navegar a la carpeta del frontend (desde la raíz del proyecto)
cd frontend

# Instalar todas las dependencias
npm install
```

Esto instalará:
- `vue` - Framework Vue 3
- `vite` - Build tool
- `@vitejs/plugin-vue` - Plugin de Vue para Vite

#### B. Verificar la URL del backend

Abre el archivo `frontend/src/App.vue` y verifica que la URL del backend en la línea 38 sea correcta:

```javascript
const response = await fetch('http://localhost:4000/api/change-password', {
```

También verifica `frontend/src/components/Login.vue` y `frontend/src/components/PersonaeList.vue` para asegurarte de que usan `http://localhost:4000`.

---

## ▶️ Ejecutar la Aplicación

### Paso 1: Iniciar el Backend

En una terminal:

```bash
cd backend
npm start
```

Deberías ver:
```
🚀 Backend corriendo en http://localhost:4000
📊 Endpoints disponibles:
   GET    /api/personas
   POST   /api/personas
   PUT    /api/personas/:id
   DELETE /api/personas/:id
   GET    /api/health
```

**✅ Verificar que el backend funciona:**
Abre tu navegador y visita: http://localhost:4000/api/health

Deberías ver:
```json
{
  "status": "OK",
  "message": "Base de datos conectada correctamente"
}
```

### Paso 2: Iniciar el Frontend

En **otra terminal** (deja el backend corriendo):

```bash
cd frontend
npm run dev
```

Deberías ver algo como:
```
VITE vX.X.X  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**✅ Abrir la aplicación:**
Visita http://localhost:5173 en tu navegador.

---

## 🔐 Credenciales por Defecto

Usuario: `admin`  
Contraseña: `admin123`

**⚠️ RECOMENDACIÓN**: Cambia la contraseña después del primer inicio de sesión usando el botón "Cambiar Contraseña".

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "Cannot connect to database" o "Failed to fetch"

**Causa**: El backend no puede conectarse a MySQL.

**Solución**:
1. Verifica que MySQL esté corriendo:
   - Windows: Busca "Services" y verifica que MySQL80 esté Running
   - O abre MySQL Workbench y verifica la conexión

2. Verifica las credenciales en `backend/server.js`:
   - Usuario correcto
   - Contraseña correcta
   - Base de datos `agencia` existe

3. Verifica el puerto de MySQL (por defecto 3306)

4. Prueba la conexión manualmente:
   ```bash
   mysql -u root -p
   # Ingresa tu contraseña
   USE agencia;
   SHOW TABLES;
   ```

---

### ❌ Error: "Table 'agencia.personas' doesn't exist"

**Causa**: Las tablas de la base de datos no fueron creadas.

**Solución**:
1. Ejecuta el script `database/schema.sql` en MySQL Workbench
2. Ejecuta el script `database/login_schema.sql`
3. Verifica con:
   ```sql
   USE agencia;
   SHOW TABLES;
   ```

---

### ❌ Error: "CORS error" en el navegador

**Causa**: El backend no está corriendo o el frontend no puede acceder.

**Solución**:
1. Asegúrate de que el backend esté corriendo en http://localhost:4000
2. Verifica que el backend tenga `app.use(cors());` habilitado (ya está en server.js)
3. Si cambias el puerto del backend, actualiza todas las URLs en el frontend

---

### ❌ Error: "Cannot find module" al ejecutar npm start

**Causa**: Las dependencias no están instaladas.

**Solución**:
```bash
# En la carpeta correspondiente (backend o frontend)
rm -rf node_modules
rm package-lock.json
npm install
```

---

### ❌ Error al obtener personas (401 Unauthorized)

**Causa**: No hay sesión de usuario o el token expiró.

**Solución**:
1. Cierra sesión y vuelve a iniciar sesión
2. Limpia el localStorage del navegador:
   - F12 → Application → Local Storage → Eliminar
3. Verifica que el usuario existe en la tabla `usuarios`:
   ```sql
   SELECT * FROM usuarios;
   ```

---

### ❌ Puerto ya en uso

**Causa**: Ya hay una aplicación corriendo en el puerto 4000 o 5173.

**Solución**:

Para el backend (puerto 4000):
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process
```

Para el frontend (puerto 5173):
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

---

## 📁 Estructura del Proyecto

```
ProyectoAgencia/
├── backend/
│   ├── node_modules/          # Dependencias (se crean con npm install)
│   ├── package.json           # Configuración de dependencias
│   └── server.js             # Servidor Express con todos los endpoints
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PersonaeList.vue   # Lista de personas
│   │   │   └── Login.vue          # Pantalla de login
│   │   ├── App.vue                # Componente raíz
│   │   └── main.js
│   ├── node_modules/         # Dependencias (se crean con npm install)
│   ├── package.json          # Configuración de dependencias
│   └── vite.config.js        # Configuración de Vite
├── database/
│   ├── schema.sql            # ⚠️ Script principal de BD
│   ├── login_schema.sql      # Script de usuarios
│   └── fix_password.sql      # Script de corrección de password
└── README.md                 # Documentación general
```

---

## 🎯 Checklist de Instalación

Usa esta lista para verificar que todo está configurado correctamente:

### Base de Datos
- [ ] MySQL instalado y corriendo
- [ ] Base de datos `agencia` creada
- [ ] Script `schema.sql` ejecutado
- [ ] Script `login_schema.sql` ejecutado
- [ ] Tablas verificadas con `SHOW TABLES;`
- [ ] Usuario admin creado (verificar con `SELECT * FROM usuarios;`)

### Backend
- [ ] Node.js instalado
- [ ] Dependencias instaladas (`npm install` en `backend/`)
- [ ] Configuración de BD correcta en `server.js`
- [ ] Backend corriendo en http://localhost:4000
- [ ] Health check funcionando (http://localhost:4000/api/health)

### Frontend
- [ ] Dependencias instaladas (`npm install` en `frontend/`)
- [ ] Frontend corriendo en http://localhost:5173
- [ ] Puede acceder a la pantalla de login
- [ ] Login exitoso con admin/admin123

---

## 🚀 Comandos Rápidos de Referencia

### Backend
```bash
cd backend
npm install          # Instalar dependencias
npm start           # Iniciar servidor
```

### Frontend
```bash
cd frontend
npm install          # Instalar dependencias
npm run dev         # Iniciar en modo desarrollo
npm run build       # Compilar para producción
```

### Base de Datos
```bash
# Conectar a MySQL
mysql -u root -p

# Comandos útiles
USE agencia;
SHOW TABLES;
SELECT * FROM personas;
SELECT * FROM usuarios;
```

---

## 📞 Soporte

Si sigues teniendo problemas después de seguir esta guía:

1. Verifica los logs de la consola del backend para mensajes de error específicos
2. Verifica la consola del navegador (F12) para errores del frontend
3. Asegúrate de que todos los puertos necesarios estén disponibles (3306, 4000, 5173)
4. Verifica que no tengas firewall bloqueando las conexiones locales

---

**Última actualización**: Diciembre 2025
