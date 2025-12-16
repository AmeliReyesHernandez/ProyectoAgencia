# 📥 GUÍA DE INSTALACIÓN PARA CLIENTE - Sistema de Gestión de Agencia

## 👋 Bienvenida

Este documento contiene instrucciones paso a paso para instalar y usar el Sistema de Gestión de Agencia en su máquina.

**Tiempo estimado de instalación**: 20-30 minutos (primera vez)

---

## 📋 REQUISITOS PREVIOS

### Hardware Mínimo
- CPU: Intel/AMD Core i5 o superior
- RAM: 4 GB mínimo (8 GB recomendado)
- Disco: 500 MB disponibles
- Conexión: Internet no requerida (funciona offline)

### Software Requerido
- **Windows 7, 8, 10 o 11** (64-bit)
- **MySQL 8.0 Community Server** (gratuito)
- **Node.js** (incluido en instalador, si necesario)

---

## ⬇️ PASO 1: DESCARGAR E INSTALAR MYSQL

### A. Descargar MySQL
1. Ir a: https://dev.mysql.com/downloads/mysql/
2. Buscar la versión más reciente de **MySQL Community Server** (8.0+)
3. Descargar el instalador para Windows
4. Guardar en `C:\` o carpeta de descargas

### B. Instalar MySQL
1. **Ejecutar** el instalador (`.msi`)
2. **Siguiente** → Aceptar términos
3. **Seleccionar**: "Developer Default" (todas las herramientas)
4. **Siguiente** hasta "Configuración del Servidor"
   - Puerto: `3306` (dejar por defecto)
   - Servicio Windows: Sí ✓
   - Auto-iniciar: Sí ✓
5. **Configuración de MySQL**
   - Tipo: "Development Machine"
   - Connectivity: "TCP/IP" ✓
6. **Configuración de Cuenta**
   - Usuario: `root`
   - Contraseña: `1312` (memorizar esto)
   - Confirmar contraseña
7. **Siguiente** → Instalar
8. **Completar** la instalación

### C. Verificar Instalación
1. Abrir **MySQL Command Line Client** (desde Inicio)
2. Ingresar contraseña: `1312`
3. Ver el prompt `mysql>` significa que funcionó ✓

---

## 📦 PASO 2: CREAR BASE DE DATOS

### A. Descargar Scripts SQL
Debe recibir estos 3 archivos:
- `schema.sql` (tablas principales)
- `login_schema.sql` (tabla de usuarios)
- `create_indexes.sql` (índices para velocidad)

Guardar en carpeta: `C:\DatabaseScripts\` (crear si no existe)

### B. Ejecutar Scripts en Orden

#### Script 1: schema.sql
```bash
# Abrir MySQL Command Line Client
mysql -u root -p
# Ingresar contraseña: 1312

# Copiar y pegar:
SOURCE C:/DatabaseScripts/schema.sql;
```
**Resultado esperado**: `Query OK` sin errores

#### Script 2: login_schema.sql
```bash
# En el mismo prompt:
SOURCE C:/DatabaseScripts/login_schema.sql;
```
**Resultado esperado**: `Query OK` sin errores

#### Script 3: create_indexes.sql
```bash
# En el mismo prompt:
SOURCE C:/DatabaseScripts/create_indexes.sql;
```
**Resultado esperado**: Múltiples `Query OK` sin errores

### C. Verificar que Funcionó
```bash
# En el mismo prompt:
USE agencia;
SHOW TABLES;
```

**Debe mostrar**:
```
+-------------------+
| Tables_in_agencia |
+-------------------+
| aportaciones      |
| cargos            |
| estatus           |
| personas          |
| usuarios          |
+-------------------+
```

Luego escriba `EXIT;` para salir

---

## 💻 PASO 3: INSTALAR LA APLICACIÓN

### A. Descargar Ejecutable
1. Recibir archivo: `Sistema de Gestión de Agencia.exe`
2. Guardar en: `C:\Program Files\SistemaAgencia\` (crear carpeta)

### B. Crear Acceso Directo (Opcional pero Recomendado)
1. **Botón derecho** en `Sistema de Gestión de Agencia.exe`
2. **Enviar a** → **Escritorio (crear acceso directo)**
3. Ahora puede hacer doble clic desde el Escritorio

### C. Primer Inicio
1. **Ejecutar** `Sistema de Gestión de Agencia.exe`
2. **Esperar 5 segundos** (inicia backend automáticamente)
3. Debería aparecer la ventana de login

---

## 🔐 PASO 4: PRIMER LOGIN

### Credenciales Iniciales
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Procedimiento
1. Escribir `admin` en campo usuario
2. Escribir `admin123` en campo contraseña
3. Hacer clic en **"Ingresar"**
4. Debería mostrar la lista vacía de personas ✓

---

## 🎯 USO BÁSICO

### Agregar Persona
1. Hacer clic en botón **"+ Agregar Persona"** (arriba a la derecha)
2. Llenar campos:
   - **Nombre**: (obligatorio)
   - **Apellido Paterno**: (obligatorio)
   - **Apellido Materno**: (opcional)
   - **Edad**: (opcional)
   - Otros campos: según sea necesario
3. Hacer clic en **"Guardar Persona"**
4. Persona aparecerá en la lista

### Editar Persona
1. Hacer clic en una persona en la lista
2. Hacer clic en **"Editar"**
3. Modificar campos
4. Hacer clic en **"Guardar Persona"**

### Eliminar Persona
1. Hacer clic en una persona
2. Hacer clic en **"Eliminar"** (con ⚠️)
3. Confirmar en ventana emergente

### Agregar Aportación
1. Hacer clic en una persona
2. Ir a pestaña **"Aportaciones"**
3. Hacer clic en **"+ Agregar Aportación"**
4. Llenar datos (año, cooperación, asistencias, etc.)
5. Hacer clic en **"Guardar Aportación"**

### Agregar Cargo
1. Hacer clic en una persona
2. Ir a pestaña **"Cargos"**
3. Hacer clic en **"+ Asignar Cargo"**
4. Seleccionar cargo y fecha
5. Hacer clic en **"Guardar Cargo"**

---

## 🔍 FILTROS Y BÚSQUEDA

### Filtrar por Estatus
- Botones azules en la parte superior: **Todos**, **Activos**, **Inactivos**, etc.
- Hacer clic para ver solo personas en ese estado

### Buscar por Nombre
- Campo de búsqueda: **"Buscar por nombre..."**
- Escribir nombre o apellido
- Busca en tiempo real mientras escribe

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Problema: "No se puede conectar a la aplicación"

**Causa**: MySQL no está corriendo

**Solución**:
1. Abrir **Servicios** (buscar en Inicio)
2. Buscar **MySQL80** en la lista
3. Si está pausado (rojo): Hacer clic derecho → **Iniciar**
4. Intentar nuevamente

---

### Problema: "Table doesn't exist" (Tabla no existe)

**Causa**: Scripts SQL no se ejecutaron correctamente

**Solución**:
1. Abrir MySQL Command Line Client
2. Escribir: `USE agencia;`
3. Escribir: `SHOW TABLES;`
4. Si solo muestra 1-2 tablas: Repetir PASO 2
5. Escribir: `EXIT;` para salir

---

### Problema: "Login incorrecto" (usuario/contraseña)

**Causa**: Tabla de usuarios no existe

**Solución**:
1. Abrir MySQL Command Line Client
2. Escribir: `SOURCE C:/DatabaseScripts/login_schema.sql;`
3. Escribir: `EXIT;`
4. Reiniciar aplicación

---

### Problema: "Aplicación muy lenta"

**Causa**: Índices no creados o MySQL está lento

**Solución**:
1. Verificar que script `create_indexes.sql` fue ejecutado
2. Reiniciar MySQL (ver sección de Servicios arriba)
3. Cerrar otras aplicaciones (consume RAM)

---

### Problema: "No puedo iniciar MySQL desde instalador"

**Causa**: Puerto 3306 en uso

**Solución**:
1. Cambiar puerto a `3307` en instalador de MySQL
2. Luego actualizar archivo de configuración de la aplicación
3. Contactar soporte técnico si persiste

---

## 📊 OPERACIONES DIARIAS

### Iniciar la Aplicación
1. Hacer doble clic en acceso directo del Escritorio
2. **O**: `C:\Program Files\SistemaAgencia\Sistema de Gestión de Agencia.exe`
3. Esperar a que aparezca ventana de login (5 segundos)

### Cerrar la Aplicación
1. Hacer clic en botón **X** (arriba a la derecha)
2. **O**: Presionar `ALT + F4`
3. MySQL sigue corriendo en segundo plano (es normal)

### Mantener Datos
- Los datos se guardan automáticamente en la base de datos MySQL
- Cerrar y abrir la aplicación mantiene todos los datos ✓

---

## 💾 BACKUP (Resguardo de Datos)

### Crear Backup Manualmente

**Windows (Línea de Comandos)**:
```bash
cd C:\DatabaseScripts
mysqldump -u root -p agencia > backup_agencia.sql
# Ingresar contraseña: 1312
```

Esto crea archivo `backup_agencia.sql` con todos los datos.

**Guardar este archivo en USB o nube como respaldo.**

### Restaurar Datos desde Backup

```bash
mysql -u root -p agencia < C:\DatabaseScripts\backup_agencia.sql
# Ingresar contraseña: 1312
```

---

## 📧 SOPORTE TÉCNICO

Si encuentra problemas que no puede resolver:

1. **Anotar**: Qué hizo, qué pasó, qué error vio
2. **Tomar screenshot**: De la pantalla de error
3. **Contactar a**:
   - Email: [EMAIL DE SOPORTE]
   - Teléfono: [TELÉFONO DE SOPORTE]
   - Horario: Lunes a Viernes 9:00 - 17:00

**Incluir en el mensaje**:
- Descripción del problema
- Screenshot de error
- Paso a paso de lo que hizo
- Versión del Sistema Operativo (Windows 7/8/10/11)

---

## 🎓 TIPS ÚTILES

✅ **Hacer backup semanal** de la BD  
✅ **Cambiar contraseña del admin** después de instalar  
✅ **Mantener MySQL actualizado** (revisiones de seguridad)  
✅ **No modificar archivos .env** (pueden causar errores)  
✅ **Apagar computadora correctamente** (no forzar apagado)  

---

## 📖 MÁS INFORMACIÓN

Para información avanzada o desarrollo:
- Ver `README.md` (documentación técnica)
- Ver `CHECKLIST_DEPLOYMENT.md` (para TI/administradores)
- Ver `RESUMEN_EJECUTIVO.md` (para gerentes)

---

**Versión**: 1.0  
**Última actualización**: 2024  
**Estado**: Listo para Producción ✅

¡Gracias por usar el Sistema de Gestión de Agencia!

---

## 📞 Checklist de Completitud

- [ ] MySQL 8.0 instalado
- [ ] Scripts SQL ejecutados (3 archivos)
- [ ] Aplicación descargada e instalada
- [ ] Primer login con admin/admin123 funciona
- [ ] Al menos una persona agregada y guardada
- [ ] Backup realizado (opcional pero recomendado)

**Cuando todo esté marcado ✓, está listo para usar la aplicación.**
