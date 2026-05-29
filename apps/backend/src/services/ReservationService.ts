import pool from '../config/database';
import { Reservation, CreateReservationInput, UpdateReservationInput } from '../models/Reservation';

export class ReservationService {
  async createReservation(input: CreateReservationInput): Promise<Reservation> {
    const { user_id, spot_id, start_time, end_time, total_price, status } = input;
    const query = `
      INSERT INTO reservations (user_id, spot_id, start_time, end_time, total_price, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      user_id,
      spot_id,
      start_time,
      end_time || null,
      total_price || null,
      status || 'active'
    ]);
    return result.rows[0];
  }

  async getReservationById(id: number): Promise<Reservation | null> {
    const query = 'SELECT * FROM reservations WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getReservationsByUserId(user_id: number): Promise<Reservation[]> {
    const query = 'SELECT * FROM reservations WHERE user_id = $1;';
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  async getReservationsBySpotId(spot_id: number): Promise<Reservation[]> {
    const query = 'SELECT * FROM reservations WHERE spot_id = $1;';
    const result = await pool.query(query, [spot_id]);
    return result.rows;
  }

  async getAllReservations(): Promise<Reservation[]> {
    const query = 'SELECT * FROM reservations;';
    const result = await pool.query(query);
    return result.rows;
  }

  async updateReservation(id: number, input: UpdateReservationInput): Promise<Reservation | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.user_id !== undefined) {
      updates.push(`user_id = $${paramIndex++}`);
      values.push(input.user_id);
    }
    if (input.spot_id !== undefined) {
      updates.push(`spot_id = $${paramIndex++}`);
      values.push(input.spot_id);
    }
    if (input.start_time !== undefined) {
      updates.push(`start_time = $${paramIndex++}`);
      values.push(input.start_time);
    }
    if (input.end_time !== undefined) {
      updates.push(`end_time = $${paramIndex++}`);
      values.push(input.end_time);
    }
    if (input.total_price !== undefined) {
      updates.push(`total_price = $${paramIndex++}`);
      values.push(input.total_price);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }

    if (updates.length === 0) return this.getReservationById(id);

    values.push(id);
    const query = `
      UPDATE reservations
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteReservation(id: number): Promise<boolean> {
    const query = 'DELETE FROM reservations WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }
}

export default new ReservationService();
