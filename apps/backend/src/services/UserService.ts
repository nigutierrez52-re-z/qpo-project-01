import pool from '../config/database';
import { User, CreateUserInput, UpdateUserInput } from '../models/User';
import bcrypt from 'bcrypt';

export class UserService {
  private readonly saltRounds = 10;

  //  Validar formato de email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  //  Validar contraseña fuerte
  isStrongPassword(password: string): { isStrong: boolean; message: string } {
    if (password.length < 8) {
      return { isStrong: false, message: "La contraseña debe tener al menos 8 caracteres." };
    }
    if (!/[A-Z]/.test(password)) {
      return { isStrong: false, message: "La contraseña debe contener al menos una mayúscula." };
    }
    if (!/[a-z]/.test(password)) {
      return { isStrong: false, message: "La contraseña debe contener al menos una minúscula." };
    }
    if (!/[0-9]/.test(password)) {
      return { isStrong: false, message: "La contraseña debe contener al menos un número." };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { isStrong: false, message: "La contraseña debe contener al menos un carácter especial (!@#$%^&*)." };
    }
    return { isStrong: true, message: "Contraseña válida." };
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const { name, email, password, role, phone, location } = input;
    
    // Hash la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    
    const query = `
      INSERT INTO users (name, email, password, role, phone, location)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, password, role, phone, location, created_at;
    `;
    const result = await pool.query(query, [name, email, hashedPassword, role, phone || null, location || null]);
    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1;';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async getUserById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getAllUsers(): Promise<User[]> {
    const query = 'SELECT * FROM users;';
    const result = await pool.query(query);
    return result.rows;
  }

  // Verificar contraseña hasheada
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateUser(id: number, input: UpdateUserInput): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(input.email);
    }
    if (input.password !== undefined) {
      // Hash la contraseña si se está actualizando
      const hashedPassword = await bcrypt.hash(input.password, this.saltRounds);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }
    if (input.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(input.role);
    }
    if (input.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(input.phone);
    }
    if (input.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(input.location);
    }

    if (updates.length === 0) return this.getUserById(id);

    values.push(id);
    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }
}

export default new UserService();
