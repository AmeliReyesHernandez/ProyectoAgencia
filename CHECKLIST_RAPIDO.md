# ✅ CHECKLIST RÁPIDO - Configuración desde Cero

## 🎯 PASOS ESENCIALES (En orden)

### 1. INSTALAR SOFTWARE NECESARIO
- [ ] **Node.js 16+**: https://nodejs.org/ → Descargar e instalar
- [ ] **MySQL 8.0+**: https://dev.mysql.com/downloads/installer/ → Descargar e instalar
- [ ] Reiniciar la computadora (recomendado)

---

### 2. CONFIGURAR BASE DE DATOS

```sql
-- A. Conectar a MySQL (usa MySQL Workbench o terminal)
mysql -u root -p
-- Ingresa tu contraseña de MySQL

-- B. Crear base de datos
CREATE DATABASE IF NOT EXISTS agencia;
USE agencia;
```

**C. Ejecutar scripts SQL (EN ESTE ORDEN):**
1. ✅ `database/schema.sql` → Crea tablas personas, aportaciones, cargos, estatus
2. ✅ `database/login_schema.sql` → Crea tabla usuarios con admin/admin123

**D. Verificar:**
```sql
SHOW TABLES;
-- Debes ver: personas, aportaciones, cargos, estatus, usuarios
```

---

### 3. CONFIGURAR BACKEND

```bash
# A. Navegar a carpeta backend
cd backend

# B. Instalar dependencias
npm install

# C. IMPORTANTE: Editar server.js líneas 10-16
# Cambiar la contraseña por la de tu MySQL
```

**Editar en `backend/server.js`:**
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',           // Tu usuario de MySQL
  password: '1234',       // ⚠️ CAMBIAR por TU contraseña
  database: 'agencia',    // Debe ser 'agencia'
  port: 3306
};
```

---

### 4. CONFIGURAR FRONTEND

```bash
# A. Navegar a carpeta frontend
cd frontend

# B. Instalar dependencias
npm install
```

---

### 5. EJECUTAR APLICACIÓN

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Debe decir: "Backend corriendo en http://localhost:4000"
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Debe decir: "Local: http://localhost:5173/"
```

**Abrir navegador:**
- URL: http://localhost:5173
- Usuario: `admin`
- Contraseña: `admin123`

---

## ❌ ERRORES COMUNES

### "Failed to fetch" o "Cannot connect to database"
**Causa**: Configuración incorrecta de MySQL
**Solución**:
1. Verifica que MySQL esté corriendo (Services en Windows)
2. Verifica usuario/contraseña en `backend/server.js`
3. Prueba: http://localhost:4000/api/health

### "Table doesn't exist"
**Causa**: Scripts SQL no ejecutados
**Solución**:
1. Ejecuta `database/schema.sql`
2. Ejecuta `database/login_schema.sql`
3. Verifica: `USE agencia; SHOW TABLES;`

### "Module not found"
**Causa**: Dependencias no instaladas
**Solución**:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### "Puerto en uso"
**Causa**: Ya hay algo corriendo en el puerto
**Solución Windows PowerShell**:
```powershell
# Para puerto 4000 (backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process

# Para puerto 5173 (frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

---

## 🔍 VERIFICACIÓN RÁPIDA

Ejecuta este script para verificar la instalación:
```powershell
.\verificar_instalacion.ps1
```

---

## 📋 NOTAS IMPORTANTES

1. **Contraseña de MySQL**: Debe coincidir en `server.js`
2. **Base de datos**: DEBE llamarse `agencia` (no `mydb`)
3. **Orden de scripts**: `schema.sql` ANTES de `login_schema.sql`
4. **Puertos**: Backend=4000, Frontend=5173, MySQL=3306

---

## 📄 MÁS INFORMACIÓN

Para detalles completos, ver: **GUIA_INSTALACION.md**
