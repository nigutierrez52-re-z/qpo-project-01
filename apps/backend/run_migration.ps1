# Script para ejecutar migración de base de datos

$env:PGPASSWORD = "npg_89jDLMYOtlBb"

$sqlMigration = @"
-- Migración: Agregar campos para Anfitriones y Parqueaderos con Ubicación

-- 1. Alteración de tabla usuarios para agregar campos de anfitrión
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- 2. Alteración de tabla parkings para agregar ubicación geográfica
ALTER TABLE parkings 
ADD COLUMN IF NOT EXISTS host_id INTEGER,
ADD COLUMN IF NOT EXISTS address VARCHAR(500),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 3. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_parkings_status ON parkings(status);
CREATE INDEX IF NOT EXISTS idx_parkings_host_id ON parkings(host_id);
CREATE INDEX IF NOT EXISTS idx_parkings_location ON parkings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 4. Crear constraint de foreign key si no existe
ALTER TABLE parkings 
ADD CONSTRAINT IF NOT EXISTS fk_parkings_host 
FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE;
"@

Write-Host "Ejecutando migración de base de datos..." -ForegroundColor Cyan

try {
    $result = $sqlMigration | psql -h "ep-little-pond-aqdfizqg-pooler.c-8.us-east-1.aws.neon.tech" `
        -U "neondb_owner" `
        -d "neondb" `
        --set=sslmode=require `
        -c "SHOW databases;"
    
    Write-Host "Conexión exitosa a la base de datos" -ForegroundColor Green
    
    # Ejecutar migración usando psql
    Write-Host "Aplicando cambios..." -ForegroundColor Yellow
    
    # Para mejor compatibilidad, usaremos un archivo temporal
    $sqlFile = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.sql'
    Set-Content -Path $sqlFile -Value $sqlMigration
    
    & psql -h "ep-little-pond-aqdfizqg-pooler.c-8.us-east-1.aws.neon.tech" `
        -U "neondb_owner" `
        -d "neondb" `
        -f $sqlFile `
        --set=sslmode=require
    
    Remove-Item $sqlFile -Force
    
    Write-Host "Migración completada exitosamente" -ForegroundColor Green
}
catch {
    Write-Host "Error durante la migración: $_" -ForegroundColor Red
    exit 1
}

$env:PGPASSWORD = ""
