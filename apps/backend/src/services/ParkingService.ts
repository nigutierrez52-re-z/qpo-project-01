import pool from '../config/database';
import { Parking, CreateParkingInput, UpdateParkingInput } from '../models/Parking';

export class ParkingService {
  async createParking(input: CreateParkingInput): Promise<Parking> {
    const { host_id, spot_num, status, price, description, address, latitude, longitude } = input;
    const query = `
      INSERT INTO parkings (host_id, spot_num, status, price, description, address, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const result = await pool.query(query, [host_id, spot_num, status || 'available', price, description, address, latitude, longitude]);
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
    if (input.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(input.address);
    }
    if (input.latitude !== undefined) {
      updates.push(`latitude = $${paramIndex++}`);
      values.push(input.latitude);
    }
    if (input.longitude !== undefined) {
      updates.push(`longitude = $${paramIndex++}`);
      values.push(input.longitude);
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

  async getParkingsByHost(host_id: number): Promise<Parking[]> {
    const query = 'SELECT * FROM parkings WHERE host_id = $1;';
    const result = await pool.query(query, [host_id]);
    return result.rows;
  }

  async searchParkingsByLocation(latitude: number, longitude: number, radiusKm: number = 5): Promise<Parking[]> {
    const query = `
      SELECT * FROM parkings
      WHERE status = 'available'
      AND ST_DWithin(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint($1, $2)::geography,
        $3 * 1000
      )
      ORDER BY ST_Distance(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint($1, $2)::geography
      );
    `;
    const result = await pool.query(query, [longitude, latitude, radiusKm]);
    return result.rows;
  }

  async deleteParking(id: number): Promise<boolean> {
    const query = 'DELETE FROM parkings WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }
}

export default new ParkingService();
