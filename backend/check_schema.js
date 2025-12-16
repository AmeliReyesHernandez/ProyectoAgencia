const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1312',
    database: process.env.DB_NAME || 'agencia',
    port: process.env.DB_PORT || 3306
};

async function checkSchema() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conectado a la base de datos.');

        const [rows] = await connection.query('DESCRIBE cargos');
        console.log('Estructura de la tabla cargos:');
        console.table(rows);

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkSchema();
