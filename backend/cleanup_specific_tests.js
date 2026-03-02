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
    console.log('--- Eliminando usuarios de prueba específicos ---');
    const connection = await mysql.createConnection(dbConfig);

    try {
        // Nombres de los usuarios de prueba creados por test_empty_aportacion.js
        const testNames = ['EmptyAportacionTester', 'WithAportacionTester'];

        const [rows] = await connection.query(
            "SELECT * FROM personas WHERE nombre IN (?)",
            [testNames]
        );

        if (rows.length > 0) {
            console.log(`Encontrados ${rows.length} usuarios de prueba.`);
            const ids = rows.map(r => r.id_persona);

            // Eliminar dependencias primero para evitar error de llave foránea
            await connection.query(`DELETE FROM aportaciones WHERE id_persona IN (?)`, [ids]);
            await connection.query(`DELETE FROM cargos WHERE id_persona IN (?)`, [ids]);
            await connection.query(`DELETE FROM estatus WHERE id_persona IN (?)`, [ids]);

            // Eliminar personas
            await connection.query(`DELETE FROM personas WHERE id_persona IN (?)`, [ids]);
            console.log('✅ Usuarios eliminados correctamente.');
        } else {
            console.log('✅ No se encontraron usuarios de prueba. Ya estaban eliminados.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await connection.end();
    }
}

cleanup();
