import express from "express";
import type { Request, Response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import UserService from './services/UserService';
import ParkingService from './services/ParkingService';
import ReservationService from './services/ReservationService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS Configurado
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Cambiar según tu frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//  Rate Limiting para proteger contra fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  message: "Demasiados intentos de login. Intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // máximo 30 requests por minuto
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// ENDPOINTS

// Registro de usuario
app.post("/api/v1/auth/register", authLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Todos los campos son requeridos." });
    }

    //  Validar email
    if (!UserService.isValidEmail(email)) {
      return res.status(400).json({ message: "Email inválido." });
    }

    //  Validar contraseña fuerte
    const passwordValidation = UserService.isStrongPassword(password);
    if (!passwordValidation.isStrong) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "El email ya está registrado." });
    }

    const newUser = await UserService.createUser({
      name,
      email,
      password,
      role
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.post("/api/v1/auth/login", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos." });
    }

    const user = await UserService.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    // Verificar contraseña usando bcrypt
    const passwordMatch = await UserService.verifyPassword(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    // No devolvemos la contraseña al frontend por seguridad
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      success: true,
      message: "Bienvenido a Qpo",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Visualizar mapa (parqueaderos disponibles) 
app.get("/api/v1/parking", async (req: Request, res: Response) => {
  try {
    const available = await ParkingService.getAvailableParkings();
    return res.status(200).json(available);
  } catch (error) {
    console.error('Error obteniendo parqueaderos:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Obtener todos los parqueaderos
app.get("/api/v1/parkings", async (req: Request, res: Response) => {
  try {
    const parkings = await ParkingService.getAllParkings();
    return res.status(200).json(parkings);
  } catch (error) {
    console.error('Error obteniendo parqueaderos:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Registrar un espacio (Anfitrión) 
app.post("/api/v1/parkings", async (req: Request, res: Response) => {
  try {
    const { host_id, spot_num, price, description, address, latitude, longitude } = req.body;
    if (!host_id || !spot_num || !price || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "host_id, spot_num, price, address, latitude y longitude son requeridos." });
    }
    const newParking = await ParkingService.createParking({
      host_id,
      spot_num,
      price,
      status: 'available',
      description,
      address,
      latitude,
      longitude
    });
    return res.status(201).json(newParking);
  } catch (error) {
    console.error('Error creando parqueadero:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Cambiar estado (Disponible/No disponible) (Anfitrión)
app.patch("/api/v1/parking/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "El campo status es requerido." });
    }

    const parking = await ParkingService.updateParking(parseInt(id), { status });
    if (!parking) {
      return res.status(404).json({ message: "Parqueadero no encontrado." });
    }

    return res.status(200).json(parking);
  } catch (error) {
    console.error('Error actualizando parqueadero:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Reservar un espacio (Conductor) 
app.post("/api/v1/reservations", async (req: Request, res: Response) => {
  try {
    const { user_id, spot_id, start_time } = req.body;

    if (!user_id || !spot_id || !start_time) {
      return res.status(400).json({ message: "user_id, spot_id y start_time son requeridos." });
    }

    const parking = await ParkingService.getParkingById(spot_id);
    if (!parking || parking.status !== 'available') {
      return res.status(400).json({ message: "El parqueadero no está disponible." });
    }

    const reservation = await ReservationService.createReservation({
      user_id,
      spot_id,
      start_time: new Date(start_time),
      status: 'active'
    });

    return res.status(201).json(reservation);
  } catch (error) {
    console.error('Error creando reservación:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Obtener reservaciones del usuario
app.get("/api/v1/reservations/user/:user_id", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const reservations = await ReservationService.getReservationsByUserId(parseInt(user_id));
    return res.status(200).json(reservations);
  } catch (error) {
    console.error('Error obteniendo reservaciones:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Actualizar reservación
app.patch("/api/v1/reservations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const reservation = await ReservationService.updateReservation(parseInt(id), updates);
    if (!reservation) {
      return res.status(404).json({ message: "Reservación no encontrada." });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    console.error('Error actualizando reservación:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Obtener parqueaderos de un anfitrión específico
app.get("/api/v1/parkings/host/:host_id", async (req: Request, res: Response) => {
  try {
    const { host_id } = req.params;
    const parkings = await ParkingService.getParkingsByHost(parseInt(host_id));
    return res.status(200).json(parkings);
  } catch (error) {
    console.error('Error obteniendo parqueaderos del anfitrión:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Buscar parqueaderos disponibles por ubicación
app.get("/api/v1/parkings/search", async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius } = req.query;
    
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "latitude y longitude son requeridos." });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusKm = radius ? parseFloat(radius as string) : 5;

    const parkings = await ParkingService.searchParkingsByLocation(lat, lng, radiusKm);
    return res.status(200).json(parkings);
  } catch (error) {
    console.error('Error buscando parqueaderos:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Obtener detalles de un parqueadero específico
app.get("/api/v1/parkings/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parking = await ParkingService.getParkingById(parseInt(id));
    if (!parking) {
      return res.status(404).json({ message: "Parqueadero no encontrado." });
    }
    return res.status(200).json(parking);
  } catch (error) {
    console.error('Error obteniendo parqueadero:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Actualizar parqueadero
app.patch("/api/v1/parkings/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const parking = await ParkingService.updateParking(parseInt(id), updates);
    if (!parking) {
      return res.status(404).json({ message: "Parqueadero no encontrado." });
    }
    return res.status(200).json(parking);
  } catch (error) {
    console.error('Error actualizando parqueadero:', error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor Qpo corriendo en http://localhost:${port}`);
});