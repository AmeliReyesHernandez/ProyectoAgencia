# Guía de Deployment - Sistema de Gestión de Agencia

## Para el Cliente - Pasos de Instalación

### 1. Requisitos Previos
- Node.js v16 o superior
- MySQL 8.0 o superior
- Git (opcional)

### 2. Configuración de la Base de Datos

```bash
# Conectarse a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE agencia;
USE agencia;

# Ejecutar el script de schema
source database/schema.sql;
source database/login_schema.sql;
```

### 3. Instalación del Backend

```bash
cd backend
npm install

# Crear archivo .env basado en .env.example
cp .env.example .env

# EDITAR .env con los datos correctos:
# - DB_HOST: dirección del servidor MySQL
# - DB_USER: usuario de MySQL
# - DB_PASSWORD: contraseña de MySQL
# - DB_NAME: nombre de la BD (agencia)
# - PORT: puerto donde correrá el backend (default: 4000)
# - CORS_ORIGIN: URL del frontend (ej: http://localhost:5173)
```

### 4. Instalación del Frontend

```bash
cd frontend
npm install

# Crear archivo .env basado en .env.example
cp .env.example .env

# EDITAR .env con:
# - VITE_API_URL: URL del backend (ej: http://localhost:4000/api)
```

### 5. Crear Usuario Admin

```bash
cd backend
node reset_admin.js
# Esto crea/resetea el usuario admin con contraseña: admin123
```

### 6. Iniciar la Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Backend correrá en http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend correrá en http://localhost:5173
```

## Para Producción

### Backend
1. Cambiar `NODE_ENV=production` en `.env`
2. Configurar `CORS_ORIGIN` con el dominio real del cliente
3. Usar un gestor de procesos como `PM2`:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "agencia-backend"
   ```

### Frontend
1. Compilar para producción:
   ```bash
   npm run build
   ```
2. Los archivos estáticos estarán en la carpeta `dist/`
3. Servir con un servidor web (Nginx, Apache, etc.)

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
- Verificar credenciales en `.env`
- Asegurar que MySQL está corriendo
- Verificar que el usuario tiene permisos

### Error: "Cannot GET /api/personas"
- Verificar que el backend está corriendo
- Verificar que `CORS_ORIGIN` en backend incluye la URL del frontend
- Verificar que `VITE_API_URL` en frontend es correcto

### Error: "Database agencia does not exist"
- Ejecutar los scripts SQL: `schema.sql` y `login_schema.sql`
- Verificar que `DB_NAME` en `.env` es "agencia"

## Variables de Entorno Importantes

### Backend (.env)
- `DB_HOST`: Servidor MySQL (default: localhost)
- `DB_USER`: Usuario MySQL (default: root)
- `DB_PASSWORD`: Contraseña MySQL (default: 1312)
- `DB_NAME`: Nombre de la BD (default: agencia)
- `DB_PORT`: Puerto MySQL (default: 3306)
- `PORT`: Puerto del backend (default: 4000)
- `NODE_ENV`: Entorno (development/production)
- `CORS_ORIGIN`: URLs permitidas para CORS (ej: http://cliente.com,https://cliente.com)

### Frontend (.env)
- `VITE_API_URL`: URL de la API (ej: http://backend.com:4000/api)

## Credenciales por Defecto
- Usuario: `admin`
- Contraseña: `admin123`

**CAMBIAR ESTA CONTRASEÑA DESPUÉS DE INSTALAR EN PRODUCCIÓN**
