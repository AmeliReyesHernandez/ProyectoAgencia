-- =========================================
-- ÍNDICES PARA OPTIMIZACIÓN DE PERFORMANCE
-- =========================================
-- Ejecutar este script DESPUÉS de crear las tablas con schema.sql

USE agencia;

-- Índices en tabla PERSONAS
ALTER TABLE personas ADD INDEX idx_personas_apellido_paterno (apellido_paterno);
ALTER TABLE personas ADD INDEX idx_personas_nombre (nombre);
ALTER TABLE personas ADD INDEX idx_personas_curp (curp);

-- Índices en tabla CARGOS
ALTER TABLE cargos ADD INDEX idx_cargos_id_persona (id_persona);
ALTER TABLE cargos ADD INDEX idx_cargos_fecha_inicio (fecha_inicio);

-- Índices en tabla ESTATUS
ALTER TABLE estatus ADD INDEX idx_estatus_id_persona (id_persona);
ALTER TABLE estatus ADD INDEX idx_estatus_estatus (estatus);

-- Índices en tabla APORTACIONES
ALTER TABLE aportaciones ADD INDEX idx_aportaciones_id_persona (id_persona);
ALTER TABLE aportaciones ADD INDEX idx_aportaciones_ano (ano);

-- Índices en tabla USUARIOS
ALTER TABLE usuarios ADD INDEX idx_usuarios_username (username);

-- Verificar índices creados
SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'agencia' AND TABLE_NAME != 'information_schema';
