-- Migración: Agregar campos para Anfitriones y Parqueaderos con Ubicación

-- 1. Alteración de tabla usuarios para agregar campos de anfitrión
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- 2. Alteración de tabla parkings para agregar ubicación geográfica
ALTER TABLE parkings 
ADD COLUMN IF NOT EXISTS host_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS address VARCHAR(500),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 3. Crear índices para mejorar performance de búsquedas por ubicación
CREATE INDEX IF NOT EXISTS idx_parkings_status ON parkings(status);
CREATE INDEX IF NOT EXISTS idx_parkings_host_id ON parkings(host_id);
CREATE INDEX IF NOT EXISTS idx_parkings_location ON parkings(latitude, longitude);

-- 4. Crear índice para búsquedas por email de usuarios (si no existe)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
