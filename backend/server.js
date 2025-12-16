const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración BD
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'agencia',
  port: 3306

};

// Pool de conexiones para mejor rendimiento
const pool = mysql.createPool(dbConfig);

// Helper function to convert empty values to null
const toNullIfEmpty = (value) => {
  if (value === '' || value === undefined || value === null) {
    return null;
  }
  return value;
};

// ========== ENDPOINTS PARA PERSONAS ==========
// Obtener todas las personas con su cargo y estatus actual
app.get('/api/personas', async (req, res) => {
  try {
    const { estatus } = req.query; // Filtro opcional por estatus

    let query = `
      SELECT 
        p.*,
        c.cargo,
        c.fecha_inicio AS cargo_fecha_inicio,
        c.fecha_fin AS cargo_fecha_fin,
        COALESCE(e.estatus, 'activos') as estatus,
        e.fecha_asignacion AS estatus_fecha
      FROM personas p
      LEFT JOIN (
        SELECT c1.id_persona, c1.cargo, c1.fecha_inicio, c1.fecha_fin
        FROM cargos c1
        WHERE c1.id_cargo = (
          SELECT c2.id_cargo
          FROM cargos c2
          WHERE c2.id_persona = c1.id_persona
          ORDER BY c2.fecha_inicio DESC, c2.id_cargo DESC
          LIMIT 1
        )
      ) c ON p.id_persona = c.id_persona
      LEFT JOIN (
        SELECT e1.id_persona, e1.estatus, e1.fecha_asignacion
        FROM estatus e1
        WHERE e1.id_estatus = (
          SELECT e2.id_estatus
          FROM estatus e2
          WHERE e2.id_persona = e1.id_persona
          ORDER BY e2.fecha_asignacion DESC, e2.id_estatus DESC
          LIMIT 1
        )
      ) e ON p.id_persona = e.id_persona
    `;

    // Agregar filtro si se especificó estatus
    if (estatus) {
      query += ` WHERE e.estatus = ?`;
      const [rows] = await pool.query(query, [estatus]);
      res.json(rows);
    } else {
      const [rows] = await pool.query(query);
      res.json(rows);
    }
  } catch (error) {
    console.error('Error en GET /api/personas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener una persona por ID
app.get('/api/personas/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM personas WHERE id_persona = ?',
      [req.params.id]
    );
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
    await connection.beginTransaction();

    const {
      nombre, apellido_paterno, apellido_materno, edad, direccion, telefono, ano_alta_agencia,
      curp, credencial, carta_compromiso, constancia_no_adeudo,
      solicitud_toma_agua, autorizacion_toma_agua, solicitud_cambio_propietario,
      respuesta_solicitud_cambio_propietario,
      cargo, estatus, cargo_fecha_inicio, cargo_fecha_fin, // Recibimos cargo y estatus
      aportacion_inicial // Objeto opcional con datos de la primera aportación
    } = req.body;

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
      // Usar fecha proporcionada o fecha actual por defecto para inicio
      const fechaInicio = cargo_fecha_inicio || new Date();
      // fechaFin es opcional (puede ser null/undefined si sigue activo)

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
    console.log('Backend: Revisando aportacion_inicial:', aportacion_inicial); // DEBUG LOG

    // Verificamos si existe el objeto y si tiene al menos la cooperación (que es obligatoria)
    // O si tiene el año definido
    if (aportacion_inicial && (aportacion_inicial.cooperacion_rastreo || aportacion_inicial.multa > 0 || aportacion_inicial.asistio_tequios)) {
      console.log('Backend: Insertando aportación inicial...');
      const { ano, cooperacion_rastreo, asistio_tequios, asistio_reuniones, multa } = aportacion_inicial;

      await connection.query(
        `INSERT INTO aportaciones (id_persona, ano, cooperacion_rastreo, asistio_tequios, asistio_reuniones, multa)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          personaId,
          ano || new Date().getFullYear(),
          cooperacion_rastreo || 'Sin registro', // Valor por defecto para evitar fallo si falta
          asistio_tequios || 'No',
          asistio_reuniones || 'No',
          multa || 0
        ]
      );
      console.log('Backend: Aportación insertada correctamente.');
    } else {
      console.log('Backend: No se detectaron datos suficientes para crear aportación inicial.');
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
    const {
      nombre, apellido_paterno, apellido_materno, edad, direccion, telefono, ano_alta_agencia,
      curp, credencial, carta_compromiso, constancia_no_adeudo,
      solicitud_toma_agua, autorizacion_toma_agua, solicitud_cambio_propietario,
      respuesta_solicitud_cambio_propietario
    } = req.body;

    await pool.query(
      `UPDATE personas SET 
        nombre=?, apellido_paterno=?, apellido_materno=?, edad=?, direccion=?, telefono=?, ano_alta_agencia=?,
        curp=?, credencial=?, carta_compromiso=?, constancia_no_adeudo=?,
        solicitud_toma_agua=?, autorizacion_toma_agua=?, solicitud_cambio_propietario=?, respuesta_solicitud_cambio_propietario=?
       WHERE id_persona=?`,
      [
        nombre,
        apellido_paterno,
        toNullIfEmpty(apellido_materno),
        toNullIfEmpty(edad),
        toNullIfEmpty(direccion),
        toNullIfEmpty(telefono),
        toNullIfEmpty(ano_alta_agencia),
        toNullIfEmpty(curp),
        toNullIfEmpty(credencial),
        toNullIfEmpty(carta_compromiso),
        toNullIfEmpty(constancia_no_adeudo),
        toNullIfEmpty(solicitud_toma_agua),
        toNullIfEmpty(autorizacion_toma_agua),
        toNullIfEmpty(solicitud_cambio_propietario),
        toNullIfEmpty(respuesta_solicitud_cambio_propietario),
        req.params.id
      ]
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

    // Eliminar dependencias primero
    await connection.query('DELETE FROM aportaciones WHERE id_persona = ?', [req.params.id]);
    await connection.query('DELETE FROM cargos WHERE id_persona = ?', [req.params.id]);
    await connection.query('DELETE FROM estatus WHERE id_persona = ?', [req.params.id]);

    // Eliminar persona
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
// Obtener aportaciones de una persona
app.get('/api/personas/:id/aportaciones', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM aportaciones WHERE id_persona = ? ORDER BY ano DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/personas/:id/aportaciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear nueva aportación
app.post('/api/personas/:id/aportaciones', async (req, res) => {
  try {
    console.log('Recibiendo aportación. Body:', req.body);
    console.log('Params:', req.params);
    const { ano, cooperacion_rastreo, asistio_tequios, asistio_reuniones, multa } = req.body;

    // Validación básica
    if (!cooperacion_rastreo) {
      return res.status(400).json({ error: 'El campo Cooperación de rastreo es obligatorio' });
    }

    const [result] = await pool.query(
      `INSERT INTO aportaciones (id_persona, ano, cooperacion_rastreo, asistio_tequios, asistio_reuniones, multa)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, ano, cooperacion_rastreo, asistio_tequios || 'No', asistio_reuniones || 'No', multa || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Aportación creada exitosamente' });
  } catch (error) {
    console.error('Error en POST /api/personas/:id/aportaciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar aportación (DESHABILITADO POR SEGURIDAD)
/*
app.put('/api/aportaciones/:id', async (req, res) => {
  try {
    const { cooperacion_rastreo, asistio_tequios, asistio_reuniones, multa } = req.body;
    await pool.query(
      `UPDATE aportaciones SET cooperacion_rastreo=?, asistio_tequios=?, asistio_reuniones=?, multa=? WHERE id_aportacion=?`,
      [cooperacion_rastreo, asistio_tequios, asistio_reuniones, multa, req.params.id]
    );
    res.json({ message: 'Aportación actualizada exitosamente' });
  } catch (error) {
    console.error('Error en PUT /api/aportaciones/:id:', error);
    res.status(500).json({ error: error.message });
  }
});
*/

// Eliminar aportación
app.delete('/api/aportaciones/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM aportaciones WHERE id_aportacion = ?', [req.params.id]);
    res.json({ message: 'Aportación eliminada exitosamente' });
  } catch (error) {
    console.error('Error en DELETE /api/aportaciones/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ENDPOINTS PARA CARGOS ==========
// Obtener historial de cargos de una persona
app.get('/api/personas/:id/cargos', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM cargos WHERE id_persona = ? ORDER BY fecha_inicio DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/personas/:id/cargos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Asignar nuevo cargo
app.post('/api/cargos', async (req, res) => {
  try {
    console.log('POST /api/cargos - Body recibido:', req.body); // DEBUG LOG
    const { id_persona, cargo, fecha_inicio, fecha_fin } = req.body;

    if (!id_persona || !cargo || !fecha_inicio) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const [result] = await pool.query(
      'INSERT INTO cargos (id_persona, cargo, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)',
      [id_persona, cargo, fecha_inicio, fecha_fin || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Cargo asignado exitosamente' });
  } catch (error) {
    console.error('Error en POST /api/cargos:', error);
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      return res.status(400).json({ error: 'Valor de cargo inválido. Revise mayúsculas/minúsculas.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Actualizar cargo (para finalizarlo)
app.put('/api/cargos/:id', async (req, res) => {
  try {
    const { fecha_fin } = req.body;
    await pool.query(
      'UPDATE cargos SET fecha_fin = ? WHERE id_cargo = ?',
      [fecha_fin, req.params.id]
    );
    res.json({ message: 'Cargo actualizado exitosamente' });
  } catch (error) {
    console.error('Error en PUT /api/cargos/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ENDPOINTS DE AUTENTICACIÓN ==========

const bcrypt = require('bcrypt');

// Login
// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // DEBUG: Ver exactlyo qué llega
    console.log(`[LOGIN DEBUG] Intento de login para usuario: '${username}'`);
    if (password) {
      console.log(`[LOGIN DEBUG] Password recibido: '${password}' (len=${password.length})`);
      console.log(`[LOGIN DEBUG] Códigos ASCII: ${[...password].map(c => c.charCodeAt(0)).join(', ')}`);
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);

    if (rows.length === 0) {
      console.log(`[LOGIN FAIL] Usuario '${username}' NO encontrado en la base de datos.`);
      return res.status(401).json({ error: 'Usuario no encontrado en la Base de Datos.' });
    }

    const user = rows[0];
    console.log(`[LOGIN DEBUG] Usuario encontrado. Hash almacenado: ${user.password_hash.substring(0, 20)}...`);

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      console.log(`[LOGIN FAIL] Contraseña incorrecta para '${username}'.`);
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    // Login exitoso
    console.log(`[LOGIN SUCCESS] Login exitoso para '${username}'.`);
    res.json({ message: 'Login exitoso', userId: user.id, username: user.username });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cambiar contraseña (con restricción de 1 año)
app.put('/api/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    // 1. Verificar usuario
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const user = rows[0];

    // 2. Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    // 3. Verificar restricción de tiempo (1 año = 365 días)
    if (user.last_password_change) {
      const lastChange = new Date(user.last_password_change);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (lastChange > oneYearAgo) {
        return res.status(403).json({
          error: 'Solo puedes cambiar la contraseña una vez al año. Último cambio: ' + lastChange.toLocaleDateString()
        });
      }
    }

    // 4. Actualizar contraseña
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

// ========== HEALTH CHECK ==========
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', message: 'Base de datos conectada correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

const PORT = process.env.BACKEND_PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log('📊 Endpoints disponibles:');
  console.log('   GET    /api/personas');
  console.log('   POST   /api/personas');
  console.log('   PUT    /api/personas/:id');
  console.log('   DELETE /api/personas/:id');
  console.log('   GET    /api/health');
});
