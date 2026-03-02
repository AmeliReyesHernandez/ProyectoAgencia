const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1312',
    database: process.env.DB_NAME || 'agencia',
    port: process.env.DB_PORT || 3306
};

async function cleanup() {
    console.log('--- Buscando y eliminado datos de prueba ---');
    const connection = await mysql.createConnection(dbConfig);

    try {
        // Buscar usuarios de prueba
        const [rows] = await connection.query(
            "SELECT * FROM personas WHERE nombre LIKE '%Test%' OR nombre LIKE '%aportacion%'"
        );

        if (rows.length > 0) {
            // Eliminar registros relacionados primero
            const ids = rows.map(r => r.id_persona);
            await connection.query(`DELETE FROM aportaciones WHERE id_persona IN (?)`, [ids]);
            await connection.query(`DELETE FROM cargos WHERE id_persona IN (?)`, [ids]);
            await connection.query(`DELETE FROM estatus WHERE id_persona IN (?)`, [ids]);

            // Eliminar persona
            await connection.query(`DELETE FROM personas WHERE id_persona IN (?)`, [ids]);
            console.log('✅ Usuarios de prueba eliminados correctamente.');
        } else {
            console.log('✅ No se encontraron usuarios de prueba.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await connection.end();
    }
}

cleanup();
