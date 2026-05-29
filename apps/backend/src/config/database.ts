import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Crear el pool de conexión usando la variable del .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requerido para conexiones seguras con Neon
  }
});

export default pool;