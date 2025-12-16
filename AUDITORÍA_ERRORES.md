# 🚨 AUDITORÍA DE ERRORES POTENCIALES - Antes del Deployment

## ERRORES CRÍTICOS (Deben corregirse antes de deployment)

### 1. ⚠️ **HARDCODED URLs en Frontend Components**
**Archivo**: [frontend/src/components/PersonaeList.vue](frontend/src/components/PersonaeList.vue#L600)  
**Problema**: Se usan `http://localhost:4000` directamente en el código, no la variable de entorno
```javascript
// ❌ LÍNEA 600 - HARDCODED
const respAportaciones = await fetch(`http://localhost:4000/api/personas/${selectedPersona.value.id_persona}/aportaciones`);
```

**Impacto**: En producción (Electron), el cliente intentará conectar a localhost:4000 de OTRA máquina, FALLARÁ  
**Solución**: Usar el servicio `api.js` con variable de entorno `VITE_API_URL`

---

### 2. ⚠️ **Credenciales Hardcodeadas en Archivos de Configuración**
**Archivos afectados**:
- [backend/check_schema.js](backend/check_schema.js#L5) - Password: `1312`
- [electron-main.js](electron-main.js#L23) - DB_HOST hardcodeado a `localhost`

**Problema**: Las credenciales están en el repositorio y en el código ejecutable  
**Impacto**: Vulnerabilidad de seguridad, no escalable a múltiples clientes  
**Solución**: Mover a variables de entorno o archivos `.env` ignorados en Git

---

### 3. 🔴 **Missing Error Handling en Requests Fetch**
**Archivos afectados**: [PersonaeList.vue](frontend/src/components/PersonaeList.vue#L600)  
**Problema**: No hay try-catch en ciertos fetch calls, especialmente en la recarga de aportaciones
```vue
// ❌ Sin manejo de errores
const respAportaciones = await fetch(`http://localhost:4000/api/personas/${selectedPersona.value.id_persona}/aportaciones`);
if (respAportaciones.ok) aportaciones.value = await respAportaciones.json();
// Si falla, aportaciones.value no se actualiza, UI queda inconsistente
```

**Impacto**: UI puede quedar en estado inconsistente sin notificar al usuario  
**Solución**: Envolver en try-catch y mostrar mensaje de error

---

### 4. 🔴 **Electron Backend Initialization sin Espera Suficiente**
**Archivo**: [electron-main.js](electron-main.js#L60-80)  
**Problema**: La espera por puerto 4000 puede no ser suficiente si MySQL está lento
```javascript
// Espera máx 10 segundos, pero MySQL puede tardar más
for (let i = 0; i < 20; i++) {
  try {
    await fetch('http://localhost:4000/api/health');
    return true;
  } catch (err) {
    if (i < 19) await new Promise(r => setTimeout(r, 500));
  }
}
```

**Impacto**: En máquinas lentas, Electron intenta cargar frontend antes de que backend esté listo  
**Solución**: Aumentar timeout o mejorar la lógica de espera

---

### 5. 🔴 **Missing Input Validation en API**
**Archivo**: [backend/server.js](backend/server.js#L173)  
**Problema**: No hay validación de campos obligatorios antes de insertar en BD
```javascript
// ❌ No valida si nombre, apellido_paterno están presentes
const [result] = await connection.query(
  `INSERT INTO personas (nombre, apellido_paterno, ...)`
);
```

**Impacto**: Pueden insertarse registros con datos inválidos o vacíos  
**Solución**: Validar campos requeridos antes de INSERT

---

### 6. 🔴 **SQL Injection Risk (Baja, pero presente)**
**Archivo**: [backend/server.js](backend/server.js#L130)  
**Problema**: Aunque usa placeholders, la columna `estatus` en WHERE se construye dinámicamente
```javascript
// Relativemente seguro gracias a placeholders, pero mejor ser explícito
query += ` WHERE LOWER(COALESCE(e.estatus, 'activos')) = LOWER(?)`;
```

**Impacto**: Riesgo bajo debido a mysql2, pero buena práctica mantener seguridad  
**Solución**: Validar valores de entrada contra lista blanca

---

### 7. 🔴 **Transacciones Incompletas**
**Archivo**: [backend/server.js](backend/server.js#L250-270)  
**Problema**: En DELETE /api/personas/:id, si hay error en rollback, la conexión puede no liberarse
```javascript
catch (error) {
  await connection.rollback();  // Si esto falla, qué pasa?
  console.error(error);
  res.status(500).json({ error: error.message });
}
```

**Impacto**: Posible memory leak si hay errores en rollback  
**Solución**: Asegurar que `connection.release()` siempre se ejecute

---

## ERRORES MODERADOS

### 8. ⚠️ **Falta Validación de Email/CURP**
**Archivo**: [backend/server.js](backend/server.js#L170)  
**Problema**: Campo CURP se guarda sin validar formato
```javascript
curp: toNullIfEmpty(curp), // ¿Validación del formato CURP?
```

**Solución**: Validar formato CURP (18 caracteres, patrón específico)

---

### 9. ⚠️ **Falta Paginación en GET /api/personas**
**Archivo**: [backend/server.js](backend/server.js#L93)  
**Problema**: Si hay 10,000+ personas, carga TODO en memoria
```javascript
const [rows] = await pool.query(query, params);
res.json(rows);  // Sin paginación
```

**Impacto**: Lentitud con bases de datos grandes  
**Solución**: Agregar LIMIT y OFFSET, implementar paginación en frontend

---

### 10. ⚠️ **Logging Insuficiente para Producción**
**Archivo**: [backend/server.js](backend/server.js)  
**Problema**: Falta logging de intentos de login fallidos, cambios de datos
```javascript
console.log(`[LOGIN] Intento para usuario: ${username}`); // Solo 1 línea
// Falta: qué usuario hizo qué cambio, cuándo, de dónde
```

**Solución**: Implementar logging estructurado con winston o pino

---

## ERRORES MENORES

### 11. ℹ️ **Falta Índices en Base de Datos**
**Archivo**: [database/schema.sql](database/schema.sql)  
**Problema**: No hay índices en columnas de búsqueda frecuente
```sql
-- Falta: CREATE INDEX idx_personas_apellido ON personas(apellido_paterno);
```

---

### 12. ℹ️ **Missing Content-Type Validation**
**Archivo**: [backend/server.js](backend/server.js#L12)  
**Problema**: No valida que el Content-Type sea JSON en requests POST/PUT
```javascript
app.use(express.json()); // Esto ayuda, pero sin límite de tamaño
```

**Solución**: Agregar límite de tamaño de request
```javascript
app.use(express.json({ limit: '10kb' }));
```

---

### 13. ℹ️ **Falta Gestión de Desconexión de BD**
**Archivo**: [backend/server.js](backend/server.js)  
**Problema**: Si MySQL se desconecta, no hay reconexión automática
```javascript
const pool = mysql.createPool({
  connectionLimit: 10,
  queueLimit: 0
  // Falta: enableKeepAlive, enableCloseConnection
});
```

---

## RESUMEN DE PRIORIDADES

| Prioridad | Error | Acción |
|-----------|-------|--------|
| 🔴 CRÍTICA | URLs Hardcodeadas | Reemplazar en PersonaeList.vue línea 600 |
| 🔴 CRÍTICA | Credenciales Hardcodeadas | Mover `check_schema.js` a env vars |
| 🔴 CRÍTICA | Missing Error Handling | Agregar try-catch en PersonaeList fetch |
| 🟠 ALTA | Backend Initialization Timeout | Aumentar timeout en electron-main.js |
| 🟠 ALTA | Input Validation | Validar campos en backend/server.js |
| 🟡 MEDIA | Logging | Agregar logs en login, cambios de datos |
| 🟡 MEDIA | Paginación | Agregar LIMIT/OFFSET a GET /api/personas |
| 🟢 BAJA | Índices BD | Crear índices en schema.sql |

---

## PRÓXIMOS PASOS

1. **Corregir URLs hardcodeadas en PersonaeList.vue**
2. **Actualizar check_schema.js para usar env vars**
3. **Mejorar error handling en fetch calls**
4. **Validar inputs en backend antes de INSERT**
5. **Agregar mejor logging para auditoría**
6. **Crear índices de BD para performance**
7. **Aumentar timeout de Electron backend startup**
8. **Implementar paginación en lista de personas**

---

**Generado**: $(date)  
**Versión**: 1.0  
**Estado**: Listo para correcciones
