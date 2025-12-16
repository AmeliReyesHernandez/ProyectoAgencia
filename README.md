# 🏢 Sistema de Gestión de Agencia

Sistema completo de gestión para agencias que incluye administración de personas, aportaciones, cargos y estatus.

## 📋 Características

- ✅ **Gestión de Personas**: CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ **Gestión de Aportaciones**: Seguimiento de contribuciones anuales
- ✅ **Gestión de Cargos**: Asignación de roles y responsabilidades
- ✅ **Sistema de Estatus**: Control de estados de personas
- ✅ **Interfaz Moderna**: Diseño responsive con Vue.js
- ✅ **API RESTful**: Backend con Node.js y Express
- ✅ **Base de Datos MySQL**: Almacenamiento robusto y confiable

## 🛠️ Tecnologías

### Frontend
- **Vue.js 3** - Framework progresivo de JavaScript
- **Vite** - Build tool rápido
- **CSS moderno** - Diseño con gradientes y animaciones

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **MySQL2** - Cliente MySQL para Node.js
- **CORS** - Manejo de peticiones entre dominios

### Base de Datos
- **MySQL 8.0+** - Sistema de gestión de base de datos

## 🚀 Instalación Rápida

### ⚡ INICIO RÁPIDO

**¿Primera vez instalando? → Lee [`CHECKLIST_RAPIDO.md`](CHECKLIST_RAPIDO.md)**

**¿Necesitas ayuda detallada? → Lee [`GUIA_INSTALACION.md`](GUIA_INSTALACION.md)**

### Requisitos Previos

- **Node.js 16+** - [Descargar](https://nodejs.org/)
- **MySQL 8.0+** - [Descargar](https://dev.mysql.com/downloads/installer/)

### Pasos Básicos

#### 1. Configurar Base de Datos

```sql
-- Conectar a MySQL
mysql -u root -p

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS agencia;
USE agencia;

-- Ejecutar scripts (EN ESTE ORDEN):
-- 1. database/schema.sql
-- 2. database/login_schema.sql

-- Verificar
SHOW TABLES;
```

#### 2. Configurar Backend

```bash
cd backend
npm install

# ⚠️ EDITAR server.js línea 13:
# Cambiar password: '1234' por TU contraseña de MySQL
```

**Configuración en `backend/server.js` (líneas 10-16):**
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',      // ⚠️ CAMBIAR por tu contraseña
  database: 'agencia',   // ⚠️ DEBE ser 'agencia'
  port: 3306
};
```

#### 3. Configurar Frontend

```bash
cd frontend
npm install
```

#### 4. Ejecutar la Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Abrir navegador:**
- 🌐 http://localhost:5173
- 👤 Usuario: `admin`
- 🔑 Contraseña: `admin123`

### ✅ Verificar Instalación

```powershell
# Ejecutar script de verificación
.\verificar_instalacion.ps1
```

### 🔍 Health Check

Verifica que el backend esté funcionando:
- http://localhost:4000/api/health

---

### 📚 Documentación Adicional

- **[CHECKLIST_RAPIDO.md](CHECKLIST_RAPIDO.md)** - Pasos esenciales resumidos
- **[GUIA_INSTALACION.md](GUIA_INSTALACION.md)** - Guía detallada con solución de problemas
- **[verificar_instalacion.ps1](verificar_instalacion.ps1)** - Script de verificación automática

## 📡 API Endpoints

### Personae (Personas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/personae` | Obtener todas las personas |
| GET | `/api/personae/:id` | Obtener persona por ID |
| POST | `/api/personae` | Crear nueva persona |
| PUT | `/api/personae/:id` | Actualizar persona |
| DELETE | `/api/personae/:id` | Eliminar persona |

### Aportaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/aportaciones` | Obtener todas las aportaciones |
| GET | `/api/aportaciones/persona/:id` | Obtener aportaciones de una persona |
| POST | `/api/aportaciones` | Crear nueva aportación |
| PUT | `/api/aportaciones/:id` | Actualizar aportación |

### Cargos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cargos` | Obtener todos los cargos |
| POST | `/api/cargos` | Crear nuevo cargo |

### Estatus

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/estatus` | Obtener todos los estatus |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Verificar conexión a BD |

## 📁 Estructura del Proyecto

```
SistemaAgencia/
├── backend/
│   ├── node_modules/
│   ├── package.json
│   └── server.js          # Servidor Express con todos los endpoints
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PersonaeList.vue  # Componente principal de personas
│   │   ├── services/
│   │   │   └── api.js            # Servicios para llamadas API
│   │   ├── App.vue               # Componente raíz
│   │   └── main.js
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── schema.sql         # Script de creación de BD
├── .gitignore
└── README.md
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**
- Verifica que MySQL esté corriendo
- Verifica que el nombre de la base de datos en `server.js` sea correcto
- Verifica usuario y contraseña en `server.js`

### Error: "Table doesn't exist"

**Solución:**
- Ejecuta el script `database/schema.sql` en MySQL Workbench
- Verifica que las tablas existan con `SHOW TABLES;`

### Error: "CORS error"

**Solución:**
- Asegúrate de que el backend esté corriendo en el puerto 4000
- El backend ya tiene CORS habilitado con `app.use(cors())`

### Los 10k cambios en Git

**Solución:**
El proyecto incluye un `.gitignore` que excluye:
- `node_modules/`
- `dist/`
- Archivos de logs y temporales

Si el problema persiste, verifica que tu repositorio Git esté **solo** en la carpeta del proyecto, no en carpetas padre.

## 🎯 Próximos Pasos

- [ ] Agregar componente para gestión de aportaciones
- [ ] Agregar componente para gestión de cargos
- [ ] Implementar búsqueda y filtros
- [ ] Agregar validación de formularios
- [ ] Implementar paginación en tablas
- [ ] Agregar autenticación de usuarios
- [ ] Generar reportes en PDF/Excel

## 📄 Licencia

Este proyecto es de uso privado para gestión interna.

## 👥 Autor

Sistema desarrollado para gestión de agencias - 2025

---

**¿Necesitas ayuda?** Consulta la guía de configuración completa en `guia_configuracion.md`
