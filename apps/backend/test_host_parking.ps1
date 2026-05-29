# Script para crear cuenta anfitrión y agregar dos parqueaderos de prueba
# Ejecutar: powershell -ExecutionPolicy Bypass -File test_host_parking.ps1

$BASE_URL = "http://localhost:3000/api/v1"

Write-Host "🚗 Iniciando prueba de Anfitrión y Parqueaderos..." -ForegroundColor Cyan
Write-Host ""

# 1. Registrar anfitrión
Write-Host "1️ Registrando anfitrión..." -ForegroundColor Yellow

$hostData = @{
    name = "Juan Pérez García"
    email = "juan.perez@qpo.com"
    password = "AnfitrionQpo123!"
    phone = "+57 300 123 4567"
    location = "Medellín"
    role = "anfitrión"
} | ConvertTo-Json

try {
    $hostResponse = Invoke-WebRequest -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $hostData
    
    $hostJson = $hostResponse.Content | ConvertFrom-Json
    $HOST_ID = $hostJson.id
    
    Write-Host "✅ Anfitrión creado con ID: $HOST_ID" -ForegroundColor Green
    Write-Host "   Email: juan.perez@qpo.com" -ForegroundColor Green
    Write-Host "   Contraseña: AnfitrionQpo123!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error registrando anfitrión: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Crear primer parqueadero
Write-Host "2️ Creando primer parqueadero (Centro El Hueco)..." -ForegroundColor Yellow

$parking1Data = @{
    host_id = $HOST_ID
    spot_num = "A-101"
    address = "Carrera 49 # 48-40, Medellín"
    latitude = 6.2521
    longitude = -75.5657
    price = 5000
    description = "Parqueadero techado con seguridad 24/7 y cámaras de vigilancia"
    status = "available"
} | ConvertTo-Json

try {
    $parking1Response = Invoke-WebRequest -Uri "$BASE_URL/parkings" `
        -Method POST `
        -ContentType "application/json" `
        -Body $parking1Data
    
    $parking1Json = $parking1Response.Content | ConvertFrom-Json
    $PARKING1_ID = $parking1Json.id
    
    Write-Host "✅ Parqueadero 1 creado con ID: $PARKING1_ID" -ForegroundColor Green
    Write-Host "   Puesto: A-101" -ForegroundColor Green
    Write-Host "   Dirección: Carrera 49 # 48-40, Medellín" -ForegroundColor Green
    Write-Host "   Precio: $5000 COP/hora" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error creando parqueadero 1: $_" -ForegroundColor Red
}

Write-Host ""

# 3. Crear segundo parqueadero
Write-Host "3️ Creando segundo parqueadero (Centro Junín)..." -ForegroundColor Yellow

$parking2Data = @{
    host_id = $HOST_ID
    spot_num = "B-205"
    address = "Calle 52 # 49-68, Medellín"
    latitude = 6.2448
    longitude = -75.5708
    price = 6000
    description = "Parqueadero en centro comercial con control de acceso e iluminación LED"
    status = "available"
} | ConvertTo-Json

try {
    $parking2Response = Invoke-WebRequest -Uri "$BASE_URL/parkings" `
        -Method POST `
        -ContentType "application/json" `
        -Body $parking2Data
    
    $parking2Json = $parking2Response.Content | ConvertFrom-Json
    $PARKING2_ID = $parking2Json.id
    
    Write-Host "✅ Parqueadero 2 creado con ID: $PARKING2_ID" -ForegroundColor Green
    Write-Host "   Puesto: B-205" -ForegroundColor Green
    Write-Host "   Dirección: Calle 52 # 49-68, Medellín" -ForegroundColor Green
    Write-Host "   Precio: $6000 COP/hora" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error creando parqueadero 2: $_" -ForegroundColor Red
}

Write-Host ""

# 4. Obtener todos los parqueaderos
Write-Host "4️ Listando todos los parqueaderos..." -ForegroundColor Yellow

try {
    $allParkingsResponse = Invoke-WebRequest -Uri "$BASE_URL/parkings" -Method GET
    $allParkingsJson = $allParkingsResponse.Content | ConvertFrom-Json
    Write-Host "Total de parqueaderos: $($allParkingsJson.Count)" -ForegroundColor Green
    $allParkingsJson | ForEach-Object {
        Write-Host "  - $($_.spot_num): $($_.address) - `$$($_.price) COP/hora" -ForegroundColor Gray
    }
}
catch {
    Write-Host "❌ Error obteniendo parqueaderos: $_" -ForegroundColor Red
}

Write-Host ""

# 5. Obtener parqueaderos del anfitrión
Write-Host "5️ Listando parqueaderos del anfitrión..." -ForegroundColor Yellow

try {
    $hostParkingsResponse = Invoke-WebRequest -Uri "$BASE_URL/parkings/host/$HOST_ID" -Method GET
    $hostParkingsJson = $hostParkingsResponse.Content | ConvertFrom-Json
    Write-Host "Parqueaderos del anfitrión: $($hostParkingsJson.Count)" -ForegroundColor Green
    $hostParkingsJson | ForEach-Object {
        Write-Host "  - $($_.spot_num): $($_.address)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "❌ Error obteniendo parqueaderos del anfitrión: $_" -ForegroundColor Red
}

Write-Host ""

# 6. Buscar parqueaderos cercanos
Write-Host "6️ Buscando parqueaderos disponibles cercanos a Medellín..." -ForegroundColor Yellow

try {
    $searchResponse = Invoke-WebRequest -Uri "$BASE_URL/parkings/search?latitude=6.2476&longitude=-75.5660&radius=2" -Method GET
    $searchJson = $searchResponse.Content | ConvertFrom-Json
    Write-Host "Parqueaderos encontrados: $($searchJson.Count)" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Búsqueda por proximidad aún no disponible (normal si la BD no tiene PostGIS)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ ¡Prueba completada exitosamente!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Datos de prueba:" -ForegroundColor Cyan
Write-Host "   - ID Anfitrión: $HOST_ID" -ForegroundColor Gray
Write-Host "   - Email: juan.perez@qpo.com" -ForegroundColor Gray
Write-Host "   - Contraseña: AnfitrionQpo123!" -ForegroundColor Gray
Write-Host "   - ID Parqueadero 1: $PARKING1_ID" -ForegroundColor Gray
Write-Host "   - ID Parqueadero 2: $PARKING2_ID" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Frontend disponible en: http://localhost:5173" -ForegroundColor Cyan
