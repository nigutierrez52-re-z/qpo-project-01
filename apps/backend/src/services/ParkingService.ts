import pool from '../config/database';
import { Parking, CreateParkingInput, UpdateParkingInput } from '../models/Parking';

export class ParkingService {
  async createParking(input: CreateParkingInput): Promise<Parking> {
    const { spot_num, status, price, description } = input;
    const query = `
      INSERT INTO parkings (spot_num, status, price, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [spot_num, status || 'available', price, description]);
    return result.rows[0];
  }

  async getParkingById(id: number): Promise<Parking | null> {
    const query = 'SELECT * FROM parkings WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getAvailableParkings(): Promise<Parking[]> {
    const query = "SELECT * FROM parkings WHERE status = 'available';";
    const result = await pool.query(query);
    return result.rows;
  }

  async getAllParkings(): Promise<Parking[]> {
    const query = 'SELECT * FROM parkings;';
    const result = await pool.query(query);
    return result.rows;
  }

  async updateParking(id: number, input: UpdateParkingInput): Promise<Parking | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.spot_num !== undefined) {
      updates.push(`spot_num = $${paramIndex++}`);
      values.push(input.spot_num);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      values.push(input.price);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }

    if (updates.length === 0) return this.getParkingById(id);

    values.push(id);
    const query = `
      UPDATE parkings
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteParking(id: number): Promise<boolean> {
    const query = 'DELETE FROM parkings WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }
}

export default new ParkingService();
