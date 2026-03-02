const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// Configurar CORS con variables de entorno
const corsOrigin = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(',');
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de request
app.use(express.urlencoded({ limit: '10kb' })); // Limitar URL encoded

// Request logger (temporal, para depuración)
app.use((req, res, next) => {
  try {
    console.log(`[REQ] ${req.method} ${req.originalUrl} body: ${JSON.stringify(req.body)}`);
    logFile && logFile(`REQ ${req.method} ${req.originalUrl} body: ${JSON.stringify(req.body)}`);
  } catch (e) { /* ignore logging errors */ }
  next();
});

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
  // Note: mysql2's createPool does not accept `enableKeepAlive` or `keepAliveInitialDelayMs` in some versions.
  // Those options cause a runtime warning. If you need keep-alive behavior, manage it at the HTTP layer
  // or upgrade/check mysql2 docs. For now we avoid passing unsupported pool options.
});

// Wrap pool.query to log SQL and params for debugging
try {
  const _origPoolQuery = pool.query.bind(pool);
  pool.query = async (sql, params) => {
    try {
      console.log('[SQL EXEC]', sql, 'params:', params);
      logFile && logFile(`SQL EXEC: ${sql} params: ${JSON.stringify(params)}`);
    } catch (e) { /* ignore logging errors */ }
    return _origPoolQuery(sql, params);
  };
} catch (e) {
  console.warn('Could not wrap pool.query for logging:', e && e.message);
}

const fs = require('fs');
const logFile = (msg) => {
  try { fs.appendFileSync('backend.log', `[${new Date().toISOString()}] ${msg}\n`); } catch (e) { /* ignore */ }
};

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
    console.log(`[PUT] /api/personas/${req.params.id} - body:`, JSON.stringify(req.body));

    // Dynamic update: build SQL based ONLY on fields present in req.body.
    // This allows clearing fields (sending null/'') or updating subsets.

    const allowedFields = [
      'nombre', 'apellido_paterno', 'apellido_materno', 'edad', 'direccion', 'telefono',
      'ano_alta_agencia', 'curp', 'credencial', 'carta_compromiso', 'constancia_no_adeudo',
      'solicitud_toma_agua', 'autorizacion_toma_agua', 'solicitud_cambio_propietario', 'respuesta_solicitud_cambio_propietario'
    ];

    const updates = [];
    const params = [];

    // Iterate over allowed fields. If present in body, add to update list.
    // Empty strings are converted to NULL.
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates.push(`${field} = ?`);
        params.push(toNullIfEmpty(req.body[field]));
      }
    }

    if (updates.length > 0) {
      const sql = `UPDATE personas SET ${updates.join(', ')} WHERE id_persona = ?`;
      params.push(req.params.id);

      console.log('Executing dynamic SQL:', sql, 'params:', params);
      logFile && logFile(`Executing dynamic SQL: ${sql} params: ${JSON.stringify(params)}`);

      const [result] = await pool.query(sql, params);
      console.log('Update result:', result && result.affectedRows ? result.affectedRows : result);
    } else {
      console.log('No persona allowed fields provided in request body; skipping personas UPDATE');
    }

    // Handle cargos if provided in payload
    // Payload may include id_cargo (existing) or cargo + cargo_fecha_inicio to create new
    if (req.body.id_cargo) {
      try {
        // Determine primary key column name for cargos table dynamically
        const [cols] = await pool.query("SHOW COLUMNS FROM cargos");
        const pkCol = (cols.find(c => c.Key === 'PRI') || {}).Field || 'id_cargo';

        const cargoParams = [];
        const cargoSets = [];
        if (req.body.cargo) { cargoSets.push('cargo = ?'); cargoParams.push(req.body.cargo); }
        if (req.body.cargo_fecha_inicio) { cargoSets.push('fecha_inicio = ?'); cargoParams.push(req.body.cargo_fecha_inicio); }
        if (req.body.cargo_fecha_fin) { cargoSets.push('fecha_fin = ?'); cargoParams.push(req.body.cargo_fecha_fin); }
        if (cargoSets.length > 0) {
          cargoParams.push(req.body.id_cargo);
          const cargoSql = `UPDATE cargos SET ${cargoSets.join(', ')} WHERE ${pkCol} = ?`;
          console.log('Executing cargo SQL:', cargoSql, 'params:', cargoParams);
          logFile(`Executing cargo SQL: ${cargoSql} params: ${JSON.stringify(cargoParams)}`);
          await pool.query(cargoSql, cargoParams);
        }
      } catch (err) {
        console.error('Error updating cargos:', err.message || err);
        // don't abort whole request for cargo update error; continue to return persona
      }
    } else if (req.body.cargo) {
      try {
        const fechaInicio = req.body.cargo_fecha_inicio || new Date();
        console.log('Inserting new cargo for persona', req.params.id, req.body.cargo, fechaInicio);
        logFile(`Inserting new cargo for persona ${req.params.id} cargo ${req.body.cargo} fechaInicio ${fechaInicio}`);
        await pool.query('INSERT INTO cargos (id_persona, cargo, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)', [req.params.id, req.body.cargo, fechaInicio, req.body.cargo_fecha_fin || null]);
      } catch (err) {
        console.error('Error inserting cargo:', err.message || err);
      }
    }

    // Handle estatus if provided
    if (req.body.estatus) {
      console.log('Inserting estatus record for persona', req.params.id, req.body.estatus);
      logFile(`Inserting estatus for persona ${req.params.id} estatus ${req.body.estatus}`);
      await pool.query('INSERT INTO estatus (id_persona, estatus, fecha_asignacion) VALUES (?, ?, CURDATE())', [req.params.id, req.body.estatus]);
    }

    // Return joined persona + latest cargo + latest estatus to the client for immediate UI update
    const [rows] = await pool.query(`
      SELECT p.*, c.id_cargo, c.cargo, c.fecha_inicio AS cargo_fecha_inicio, c.fecha_fin AS cargo_fecha_fin,
             COALESCE(e.estatus, '') as estatus, e.fecha_asignacion AS estatus_fecha
      FROM personas p
      LEFT JOIN cargos c ON p.id_persona = c.id_persona AND c.id_cargo = (
        SELECT id_cargo FROM cargos WHERE id_persona = p.id_persona ORDER BY fecha_inicio DESC LIMIT 1
      )
      LEFT JOIN estatus e ON p.id_persona = e.id_persona AND e.id_estatus = (
        SELECT id_estatus FROM estatus WHERE id_persona = p.id_persona ORDER BY fecha_asignacion DESC LIMIT 1
      )
      WHERE p.id_persona = ?
    `, [req.params.id]);

    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Persona no encontrada' });
    res.json({ message: 'Persona actualizada exitosamente', persona: rows[0] });
  } catch (error) {
    console.error('Error en PUT /api/personas/:id:', error);
    logFile(`ERROR PUT /api/personas/${req.params.id}: ${error.stack || error}`);
    // Include DB error details to help debug (temporary)
    const resp = { error: error.message };
    if (error.sqlMessage) resp.sqlMessage = error.sqlMessage;
    if (error.sql) resp.sql = error.sql;
    res.status(500).json(resp);
  }
});

// Eliminar persona
app.delete('/api/personas/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // Defensive update: read current row and update only real DB columns that changed.
    const [currentRows] = await pool.query('SELECT * FROM personas WHERE id_persona = ?', [req.params.id]);
    if (!currentRows || currentRows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }
    const current = currentRows[0];

    // Build updates only for keys that exist in the current row (actual DB columns)
    const updates = [];
    const params = [];
    for (const key of Object.keys(req.body)) {
      // only update if column exists in DB and value is not null/undefined
      if (!(key in current)) continue;
      const rawVal = req.body[key];
      if (rawVal === undefined || rawVal === null) continue;
      // compare serialized values to detect changes
      const curVal = current[key];
      if (JSON.stringify(curVal) === JSON.stringify(rawVal)) continue;
      updates.push(`${key} = ?`);
      params.push(toNullIfEmpty(rawVal));
    }

    if (updates.length > 0) {
      const sql = `UPDATE personas SET ${updates.join(', ')} WHERE id_persona = ?`;
      params.push(req.params.id);
      console.log('Executing SQL:', sql, 'params:', params);
      logFile && logFile(`Executing SQL: ${sql} params: ${JSON.stringify(params)}`);
      const [result] = await pool.query(sql, params);
      console.log('Update result:', result && result.affectedRows ? result.affectedRows : result);
      if (!result || result.affectedRows === 0) {
        console.log('No rows affected for personas update (may be identical values)');
      }
    } else {
      console.log('No persona fields to update');
    }
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
