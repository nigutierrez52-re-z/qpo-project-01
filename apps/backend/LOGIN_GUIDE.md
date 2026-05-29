# 🔐 Guía de Login - QPO

## Endpoint Implementado

### POST `/api/v1/auth/login`

Realiza la autenticación de usuarios con email y contraseña.

#### Solicitud (Request)
```json
{
  "email": "usuario@qpo.com",
  "password": "miContraseña123"
}
```

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Bienvenido a Qpo",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@qpo.com",
    "role": "conductor",
    "created_at": "2026-05-28T10:30:00Z"
  }
}
```

#### Respuestas de Error

**400 - Campos faltantes**
```json
{
  "message": "Email y contraseña son requeridos."
}
```

**401 - Credenciales inválidas**
```json
{
  "message": "Credenciales incorrectas."
}
```

**500 - Error del servidor**
```json
{
  "message": "Error interno del servidor."
}
```

## 🔒 Seguridad Implementada

### ✅ Mejoras de Seguridad

1. **Hashing de Contraseñas con bcrypt**
   - Algoritmo: bcrypt (saltRounds: 10)
   - Contraseñas nunca se almacenan en texto plano
   - Se genera un hash único para cada contraseña

2. **No exponer contraseñas**
   - La contraseña NUNCA se devuelve en la respuesta
   - Se utiliza desestructuración para excluir el campo

3. **Validación de entrada**
   - Se valida que email y password estén presentes
   - Previene inyección de datos vacíos

4. **Mensajes de error genéricos**
   - No revela si el email existe o no existe
   - Ambas situaciones devuelven "Credenciales incorrectas"
   - Evita ataques de enumeración

## 📝 Flujo de Autenticación

### Al Registrarse
```
Usuario envía password plano
         ↓
UserService.createUser() 
         ↓
bcrypt.hash(password, 10)
         ↓
Guarda hash en BD (no el password)
         ↓
Responde sin devolver password
```

### Al Hacer Login
```
Usuario envía email + password plano
         ↓
Buscar usuario por email
         ↓
UserService.verifyPassword()
         ↓
bcrypt.compare(plano, hash)
         ↓
Si coincide: Responder con user (sin password)
Si no: Responder 401 "Credenciales incorrectas"
```

## 🧪 Pruebas con cURL

### Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@qpo.com",
    "password": "MiPassword123!",
    "role": "conductor"
  }'
```

### Login Exitoso
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@qpo.com",
    "password": "MiPassword123!"
  }'
```

### Login Fallido (contraseña incorrecta)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@qpo.com",
    "password": "PasswordIncorrecto"
  }'
```

## 🛠️ Integración con Frontend

### Ejemplo React
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar usuario en estado
      setUser(data.user);
      // Guardar token si lo tienes
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } else {
      setError(data.message);
    }
  } catch (error) {
    setError('Error de conexión');
  }
};
```

## 📌 Notas Importantes

- **Contraseñas anteriores**: Si tenías contraseñas en texto plano en BD, necesitas ejecutar una migración
- **Token JWT**: Considera agregar tokens JWT para persistencia de sesión
- **HTTPS**: En producción, SIEMPRE usa HTTPS, nunca HTTP
- **Rate Limiting**: Agrega limitación de intentos para prevenir fuerza bruta

## ⚠️ Próximas Mejoras Recomendadas

1. Implementar JWT tokens
2. Agregar refresh tokens
3. Rate limiting en endpoints de auth
4. 2FA (autenticación de dos factores)
5. Email verification al registrar
6. Password reset functionality
