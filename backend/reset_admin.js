const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1234', // Asegúrate que esta sea tu contraseña de root
    database: 'agencia'
};

/* 
   INTENTA CONECTARSE Y RESETEAR LA CONTRASEÑA 
   USANDO LA MISMA LIBRERÍA DEL SERVIDOR
*/

async function resetPassword() {
    console.log('🔄 Conectando a la base de datos...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión exitosa.');

        const username = 'admin';
        const newPassword = 'admin123';

        console.log(`🔨 Generando hash para: ${newPassword}`);
        const saltRounds = 10;
        const hash = await bcrypt.hash(newPassword, saltRounds);
        console.log(`🔐 Nuevo Hash generado: ${hash}`);

        console.log('💾 Actualizando base de datos...');
        const [result] = await connection.execute(
            'UPDATE usuarios SET password_hash = ? WHERE username = ?',
            [hash, username]
        );

        if (result.affectedRows > 0) {
            console.log('✨ ¡ÉXITO! Contraseña restablecida correctamente.');
            console.log('👉 Ahora puedes ingresar con:');
            console.log(`   Usuario:  ${username}`);
            console.log(`   Password: ${newPassword}`);
        } else {
            console.log('⚠️ Error: No se encontró el usuario "admin" en la tabla.');
            console.log('   Intentando crearlo...');
            await connection.execute(
                'INSERT INTO usuarios (username, password_hash, last_password_change) VALUES (?, ?, NOW())',
                [username, hash]
            );
            console.log('✨ Usuario "admin" creado y contraseña establecida.');
        }

    } catch (error) {
        console.error('❌ Error grave:', error);
    } finally {
        if (connection) await connection.end();
    }
}

resetPassword();
