const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de conexión (misma que server.js)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1312',
    database: process.env.DB_NAME || 'agencia',
    port: process.env.DB_PORT || 3306
};

async function verifyPersistence() {
    console.log('--- Verificando Persistencia en Base de Datos ---');

    const connection = await mysql.createConnection(dbConfig);
    const uniqueName = `TestUser_${Date.now()}`;

    try {
        // 1. Crear usuario vía API (simulando frontend)
        console.log(`\n1. Creando usuario '${uniqueName}' vía API...`);
        const createRes = await fetch('http://localhost:4000/api/personas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: uniqueName, apellido_paterno: 'PersistenceCheck' })
        });
        const createData = await createRes.json();
        const id = createData.id;
        console.log(`   ID creado: ${id}`);

        // 2. Editar usuario vía API
        const newName = uniqueName + '_EDITADO';
        console.log(`\n2. Editando nombre a '${newName}' vía API...`);
        await fetch(`http://localhost:4000/api/personas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newName })
        });

        // 3. CONSULTA DIRECTA A LA BASE DE DATOS (Lo que verías en Workbench)
        console.log('\n3. Consultando DIRECTAMENTE la base de datos (simulando Workbench)...');
        const [rows] = await connection.query('SELECT id_persona, nombre, apellido_paterno FROM personas WHERE id_persona = ?', [id]);

        console.log('   Resultado de la BD:');
        console.table(rows);

        if (rows[0].nombre === newName) {
            console.log('\n✅ ÉXITO: El cambio está guardado en la base de datos real.');
        } else {
            console.log('\n❌ ERROR: El cambio no se reflejó en la base de datos.');
        }

        // Limpieza
        await connection.query('DELETE FROM personas WHERE id_persona = ?', [id]);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await connection.end();
    }
}

verifyPersistence();
