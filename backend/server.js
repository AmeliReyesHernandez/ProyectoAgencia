const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// Configurar CORS con variables de entorno
const corsOrigin = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de request
app.use(express.urlencoded({ limit: '10kb' })); // Limitar URL encoded

// Timeout para requests (30 segundos)
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

// Configuración BD desde variables de entorno
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1312',
  database: process.env.DB_NAME || 'agencia',
  port: process.env.DB_PORT || 3306
};

// Pool de conexiones
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// ========== ENDPOINTS DE AUTENTICACIÓN ==========

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[LOGIN] Intento para usuario: ${username}`);

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    console.log(`[LOGIN] Exitoso para ${username}`);
    res.json({ message: 'Login exitoso', userId: user.id, username: user.username });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cambiar contraseña
app.put('/api/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const user = rows[0];
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      'UPDATE usuarios SET password_hash = ?, last_password_change = NOW() WHERE id = ?',
      [newHash, user.id]
    );

    res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to convert empty values to null
const toNullIfEmpty = (value) => {
  if (value === '' || value === undefined || value === null) {
    return null;
  }
  return value;
};

// ========== ENDPOINTS PARA PERSONAS ==========

// Obtener todas las personas con sus cargos y estatus (FILTERABLE POR ESTATUS)
app.get('/api/personas', async (req, res) => {
  try {
    const { estatus: estatusFiltro } = req.query; // Filtro opcional por estatus

    let query = `
      SELECT 
        p.*,
        c.id_cargo,
        c.cargo,
        c.fecha_inicio AS cargo_fecha_inicio,
        c.fecha_fin AS cargo_fecha_fin,
        COALESCE(e.estatus, 'activos') as estatus,
        e.fecha_asignacion AS estatus_fecha
      FROM personas p
      LEFT JOIN cargos c ON p.id_persona = c.id_persona 
        AND c.id_cargo = (
          SELECT id_cargo FROM cargos 
          WHERE id_persona = p.id_persona 
          ORDER BY fecha_inicio DESC LIMIT 1
        )
      LEFT JOIN estatus e ON p.id_persona = e.id_persona 
        AND e.id_estatus = (
          SELECT id_estatus FROM estatus 
          WHERE id_persona = p.id_persona 
          ORDER BY fecha_asignacion DESC LIMIT 1
        )
    `;

    // Agregar filtro si se especificó estatus
    let params = [];
    if (estatusFiltro) {
      query += ` WHERE LOWER(COALESCE(e.estatus, 'activos')) = LOWER(?)`;
      params = [estatusFiltro];
    }

    query += ` ORDER BY p.id_persona`;
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/personas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener una persona por ID
app.get('/api/personas/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM personas WHERE id_persona = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error en GET /api/personas/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear nueva persona con aportación inicial opcional
app.post('/api/personas', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // Validar campos requeridos
    const { nombre, apellido_paterno, apellido_materno, edad, direccion, telefono, ano_alta_agencia,
      curp, credencial, carta_compromiso, constancia_no_adeudo,
      solicitud_toma_agua, autorizacion_toma_agua, solicitud_cambio_propietario,
      respuesta_solicitud_cambio_propietario,
      cargo, estatus, cargo_fecha_inicio, cargo_fecha_fin,
      aportacion_inicial
    } = req.body;

    if (!nombre || !apellido_paterno) {
      return res.status(400).json({ error: 'Nombre y apellido paterno son obligatorios' });
    }

    await connection.beginTransaction();

    // 1. Insertar Persona
    const [result] = await connection.query(
      `INSERT INTO personas (
        nombre, apellido_paterno, apellido_materno, edad, direccion, telefono, ano_alta_agencia,
        curp, credencial, carta_compromiso, constancia_no_adeudo,
        solicitud_toma_agua, autorizacion_toma_agua, solicitud_cambio_propietario, respuesta_solicitud_cambio_propietario
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, apellido_paterno, toNullIfEmpty(apellido_materno), toNullIfEmpty(edad),
        toNullIfEmpty(direccion), toNullIfEmpty(telefono), toNullIfEmpty(ano_alta_agencia),
        toNullIfEmpty(curp), toNullIfEmpty(credencial), toNullIfEmpty(carta_compromiso),
        toNullIfEmpty(constancia_no_adeudo), toNullIfEmpty(solicitud_toma_agua),
        toNullIfEmpty(autorizacion_toma_agua), toNullIfEmpty(solicitud_cambio_propietario),
        toNullIfEmpty(respuesta_solicitud_cambio_propietario)
      ]
    );

    const personaId = result.insertId;

    // 2. Insertar Cargo (si existe)
    if (cargo) {
      const fechaInicio = cargo_fecha_inicio || new Date();

      await connection.query(
        'INSERT INTO cargos (id_persona, cargo, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)',
        [personaId, cargo, fechaInicio, cargo_fecha_fin || null]
      );
    }

    // 3. Insertar Estatus (si existe)
    if (estatus) {
      await connection.query(
        'INSERT INTO estatus (id_persona, estatus, fecha_asignacion) VALUES (?, ?, CURDATE())',
        [personaId, estatus]
      );
    }

    // 4. Insertar Aportación Inicial (si existe)
    if (aportacion_inicial && (aportacion_inicial.cooperacion_rastreo || aportacion_inicial.multa > 0 || aportacion_inicial.asistio_tequios)) {
      const { ano, cooperacion_rastreo, asistio_tequios, asistio_reuniones, multa } = aportacion_inicial;

      await connection.query(
        `INSERT INTO aportaciones (id_persona, ano, cooperacion_rastreo, asistio_tequios, asistio_reuniones, multa)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          personaId,
          ano || new Date().getFullYear(),
          cooperacion_rastreo || 'Sin registro',
          asistio_tequios || 'No',
          asistio_reuniones || 'No',
          multa || 0
        ]
      );
    }

    await connection.commit();
    res.status(201).json({ id: personaId, message: 'Persona creada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error en POST /api/personas:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Actualizar persona
app.put('/api/personas/:id', async (req, res) => {
  try {
    const { nombre, apellido_paterno, apellido_materno } = req.body;

    await pool.query(
      'UPDATE personas SET nombre=?, apellido_paterno=?, apellido_materno=? WHERE id_persona=?',
      [nombre, apellido_paterno, apellido_materno, req.params.id]
    );
    res.json({ message: 'Persona actualizada exitosamente' });
  } catch (error) {
    console.error('Error en PUT /api/personas/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar persona
app.delete('/api/personas/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Eliminar dependencias
    await connection.query('DELETE FROM aportaciones WHERE id_persona = ?', [req.params.id]);
    await connection.query('DELETE FROM cargos WHERE id_persona = ?', [req.params.id]);
    await connection.query('DELETE FROM estatus WHERE id_persona = ?', [req.params.id]);
    await connection.query('DELETE FROM personas WHERE id_persona = ?', [req.params.id]);

    await connection.commit();
    res.json({ message: 'Persona eliminada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error en DELETE /api/personas/:id:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// ========== ENDPOINTS PARA APORTACIONES ==========

app.get('/api/personas/:id/aportaciones', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aportaciones WHERE id_persona = ? ORDER BY ano DESC', [req.params.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/personas/:id/aportaciones', async (req, res) => {
  try {
    const { ano, cooperacion_rastreo } = req.body;
    const [result] = await pool.query(
      'INSERT INTO aportaciones (id_persona, ano, cooperacion_rastreo) VALUES (?, ?, ?)',
      [req.params.id, ano, cooperacion_rastreo]
    );
    res.status(201).json({ id: result.insertId, message: 'Aportación creada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/aportaciones/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM aportaciones WHERE id_aportacion = ?', [req.params.id]);
    res.json({ message: 'Aportación eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ENDPOINTS PARA CARGOS ==========

app.get('/api/personas/:id/cargos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cargos WHERE id_persona = ? ORDER BY fecha_inicio DESC', [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cargos', async (req, res) => {
  try {
    const { id_persona, cargo, fecha_inicio } = req.body;
    const [result] = await pool.query(
      'INSERT INTO cargos (id_persona, cargo, fecha_inicio) VALUES (?, ?, ?)',
      [id_persona, cargo, fecha_inicio]
    );
    res.status(201).json({ id: result.insertId, message: 'Cargo asignado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/cargos/:id', async (req, res) => {
  try {
    const { fecha_fin } = req.body;
    await pool.query('UPDATE cargos SET fecha_fin = ? WHERE id_cargo = ?', [fecha_fin, req.params.id]);
    res.json({ message: 'Cargo actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== HEALTH CHECK ==========

app.get('/api/health', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1');
    res.json({ status: 'OK' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS permitido desde: ${corsOrigin.join(', ')}`);
  console.log('📊 Endpoints disponibles:');
  console.log('   POST   /api/login');
  console.log('   PUT    /api/change-password');
  console.log('   GET    /api/personas');
  console.log('   POST   /api/personas');
  console.log('   PUT    /api/personas/:id');
  console.log('   DELETE /api/personas/:id');
  console.log('   GET    /api/personas/:id/aportaciones');
  console.log('   POST   /api/personas/:id/aportaciones');
  console.log('   DELETE /api/aportaciones/:id');
  console.log('   GET    /api/personas/:id/cargos');
  console.log('   POST   /api/cargos');
  console.log('   PUT    /api/cargos/:id');
  console.log('   GET    /api/health');
});
