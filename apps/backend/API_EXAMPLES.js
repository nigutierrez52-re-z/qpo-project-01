// Ejemplos de prueba para la API QPO

// 1. REGISTRAR USUARIO (Conductor)
fetch("http://localhost:3000/api/v1/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Carlos López",
    email: "carlos@example.com",
    password: "pass123",
    role: "conductor"
  })
})
.then(r => r.json())
.then(console.log);

// 2. REGISTRAR USUARIO (Anfitrión)
fetch("http://localhost:3000/api/v1/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "María García",
    email: "maria@example.com",
    password: "pass456",
    role: "anfitrión"
  })
})
.then(r => r.json())
.then(console.log);

// 3. LOGIN
fetch("http://localhost:3000/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "carlos@example.com",
    password: "pass123"
  })
})
.then(r => r.json())
.then(console.log);

// 4. CREAR PARQUEADERO (Anfitrión)
fetch("http://localhost:3000/api/v1/parkings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    spot_num: "A-101",
    price: 5000,
    description: "Parqueadero cerrado con cámara"
  })
})
.then(r => r.json())
.then(console.log);

// 5. OBTENER PARQUEADEROS DISPONIBLES
fetch("http://localhost:3000/api/v1/parking")
  .then(r => r.json())
  .then(console.log);

// 6. OBTENER TODOS LOS PARQUEADEROS
fetch("http://localhost:3000/api/v1/parkings")
  .then(r => r.json())
  .then(console.log);

// 7. CAMBIAR ESTADO DE PARQUEADERO
fetch("http://localhost:3000/api/v1/parking/1/status", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: "occupied"  // available, occupied, reserved
  })
})
.then(r => r.json())
.then(console.log);

// 8. CREAR RESERVACIÓN
fetch("http://localhost:3000/api/v1/reservations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: 1,
    spot_id: 1,
    start_time: new Date().toISOString()
  })
})
.then(r => r.json())
.then(console.log);

// 9. OBTENER RESERVACIONES DEL USUARIO
fetch("http://localhost:3000/api/v1/reservations/user/1")
  .then(r => r.json())
  .then(console.log);

// 10. ACTUALIZAR RESERVACIÓN
fetch("http://localhost:3000/api/v1/reservations/1", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: "completed",
    end_time: new Date().toISOString(),
    total_price: 5000
  })
})
.then(r => r.json())
.then(console.log);
