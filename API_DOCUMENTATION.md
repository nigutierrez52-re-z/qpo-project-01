# 📚 API Documentation - Host & Parking

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication Endpoints

### 1. Register Host (Anfitrión)
**Endpoint**: `POST /auth/register`

**Request**:
```json
{
  "name": "Juan Pérez García",
  "email": "juan.perez@qpo.com",
  "password": "AnfitrionQpo123!",
  "phone": "+57 300 123 4567",
  "location": "Medellín",
  "role": "anfitrión"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "name": "Juan Pérez García",
  "email": "juan.perez@qpo.com",
  "phone": "+57 300 123 4567",
  "location": "Medellín",
  "role": "anfitrión",
  "created_at": "2025-05-29T10:00:00Z"
}
```

**Errors**:
- 400: Todos los campos son requeridos
- 400: Email inválido
- 400: Contraseña débil
- 409: El email ya está registrado
- 500: Error interno del servidor

---

## Parking Endpoints

### 2. Create Parking
**Endpoint**: `POST /parkings`

**Request**:
```json
{
  "host_id": 1,
  "spot_num": "A-101",
  "address": "Carrera 49 # 48-40, Medellín",
  "latitude": 6.2521,
  "longitude": -75.5657,
  "price": 5000,
  "description": "Parqueadero techado con seguridad 24/7",
  "status": "available"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "host_id": 1,
  "spot_num": "A-101",
  "address": "Carrera 49 # 48-40, Medellín",
  "latitude": 6.2521,
  "longitude": -75.5657,
  "price": 5000,
  "description": "Parqueadero techado con seguridad 24/7",
  "status": "available",
  "created_at": "2025-05-29T10:00:00Z"
}
```

**Required Fields**: host_id, spot_num, price, address, latitude, longitude

---

### 3. Get All Parkings
**Endpoint**: `GET /parkings`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "host_id": 1,
    "spot_num": "A-101",
    "address": "Carrera 49 # 48-40, Medellín",
    "latitude": 6.2521,
    "longitude": -75.5657,
    "price": 5000,
    "description": "Parqueadero techado con seguridad 24/7",
    "status": "available"
  },
  {
    "id": 2,
    "host_id": 1,
    "spot_num": "B-205",
    "address": "Calle 52 # 49-68, Medellín",
    "latitude": 6.2448,
    "longitude": -75.5708,
    "price": 6000,
    "description": "Centro comercial con iluminación LED",
    "status": "available"
  }
]
```

---

### 4. Get Host Parkings
**Endpoint**: `GET /parkings/host/:host_id`

**Example**: `GET /parkings/host/1`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "host_id": 1,
    "spot_num": "A-101",
    "address": "Carrera 49 # 48-40, Medellín",
    "latitude": 6.2521,
    "longitude": -75.5657,
    "price": 5000,
    "status": "available"
  }
]
```

---

### 5. Search Parkings by Location
**Endpoint**: `GET /parkings/search?latitude=X&longitude=Y&radius=Z`

**Parameters**:
- `latitude` (required): User's latitude (decimal)
- `longitude` (required): User's longitude (decimal)
- `radius` (optional, default=5): Search radius in kilometers

**Example**: 
```
GET /parkings/search?latitude=6.2476&longitude=-75.5660&radius=2
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "host_id": 1,
    "spot_num": "A-101",
    "address": "Carrera 49 # 48-40, Medellín",
    "latitude": 6.2521,
    "longitude": -75.5657,
    "price": 5000,
    "distance_km": 0.45,
    "status": "available"
  },
  {
    "id": 2,
    "host_id": 1,
    "spot_num": "B-205",
    "address": "Calle 52 # 49-68, Medellín",
    "latitude": 6.2448,
    "longitude": -75.5708,
    "price": 6000,
    "distance_km": 1.2,
    "status": "available"
  }
]
```

**Errors**:
- 400: latitude y longitude son requeridos
- 500: Error en búsqueda

---

### 6. Get Parking Details
**Endpoint**: `GET /parkings/:id`

**Example**: `GET /parkings/1`

**Response** (200 OK):
```json
{
  "id": 1,
  "host_id": 1,
  "spot_num": "A-101",
  "address": "Carrera 49 # 48-40, Medellín",
  "latitude": 6.2521,
  "longitude": -75.5657,
  "price": 5000,
  "description": "Parqueadero techado con seguridad 24/7",
  "status": "available",
  "created_at": "2025-05-29T10:00:00Z"
}
```

**Errors**:
- 404: Parqueadero no encontrado
- 500: Error interno del servidor

---

### 7. Update Parking
**Endpoint**: `PATCH /parkings/:id`

**Example**: `PATCH /parkings/1`

**Request** (partial update):
```json
{
  "status": "occupied",
  "price": 5500
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "host_id": 1,
  "spot_num": "A-101",
  "address": "Carrera 49 # 48-40, Medellín",
  "latitude": 6.2521,
  "longitude": -75.5657,
  "price": 5500,
  "status": "occupied"
}
```

**Updateable Fields**:
- `spot_num`
- `status` ('available' | 'occupied' | 'reserved')
- `price`
- `description`
- `address`
- `latitude`
- `longitude`

---

### 8. Change Parking Status
**Endpoint**: `PATCH /parking/:id/status`

**Example**: `PATCH /parking/1/status`

**Request**:
```json
{
  "status": "occupied"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "spot_num": "A-101",
  "status": "occupied"
}
```

**Status Values**:
- `available`: Parqueadero disponible
- `occupied`: Parqueadero ocupado
- `reserved`: Parqueadero reservado

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Credenciales incorrectas |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Recurso duplicado |
| 500 | Internal Server Error - Error del servidor |

---

## Error Response Format

```json
{
  "message": "Descripción del error"
}
```

---

## Rate Limiting

- **Auth Endpoints**: 5 requests por 15 minutos por IP
- **General Endpoints**: 30 requests por minuto por IP

---

## Data Types & Formats

### Parking Status
```
'available' | 'occupied' | 'reserved'
```

### User Role
```
'conductor' | 'anfitrión' | 'user'
```

### Coordinates
- **Latitude**: -90 to 90 (decimal degrees)
- **Longitude**: -180 to 180 (decimal degrees)
- **Precision**: 8 decimal places (max ~1.1mm)

### Price
- Integer in COP (Colombian Pesos)
- Minimum: 0
- Step: 500 (common increments)

---

## Example Flows

### Flow 1: Register Host and Create 2 Parkings

```bash
# 1. Register host
HOST_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Juan Perez","email":"juan@qpo.com",
    "password":"AnfitrionQpo123!","phone":"+57 300 1234567",
    "location":"Medellin","role":"anfitrion"
  }')

HOST_ID=$(echo $HOST_RESPONSE | jq -r '.id')

# 2. Create parking 1
curl -X POST http://localhost:3000/api/v1/parkings \
  -H "Content-Type: application/json" \
  -d "{
    \"host_id\":$HOST_ID,\"spot_num\":\"A-101\",
    \"address\":\"Carrera 49 # 48-40, Medellin\",
    \"latitude\":6.2521,\"longitude\":-75.5657,
    \"price\":5000,\"description\":\"Techado con seguridad\"
  }"

# 3. Create parking 2
curl -X POST http://localhost:3000/api/v1/parkings \
  -H "Content-Type: application/json" \
  -d "{
    \"host_id\":$HOST_ID,\"spot_num\":\"B-205\",
    \"address\":\"Calle 52 # 49-68, Medellin\",
    \"latitude\":6.2448,\"longitude\":-75.5708,
    \"price\":6000,\"description\":\"Centro comercial\"
  }"
```

### Flow 2: Search Nearby Parkings

```bash
# User's location: Medellín center
# Latitude: 6.2476, Longitude: -75.5660

curl "http://localhost:3000/api/v1/parkings/search?latitude=6.2476&longitude=-75.5660&radius=2"
```

---

## CORS Configuration

Frontend can request from:
- `http://localhost:5173`
- `http://localhost:5174`
- Custom URLs (configure in backend)

Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Headers: Content-Type, Authorization

---

## Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50), -- 'conductor', 'anfitrión', 'user'
  phone VARCHAR(20),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Parkings Table
CREATE TABLE parkings (
  id SERIAL PRIMARY KEY,
  host_id INTEGER REFERENCES users(id),
  spot_num VARCHAR(50),
  address VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price INTEGER,
  description TEXT,
  status VARCHAR(50), -- 'available', 'occupied', 'reserved'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

Last Updated: 2025-05-29
