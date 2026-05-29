export interface Parking {
  id: number;
  host_id: number;
  spot_num: string;
  status: 'available' | 'occupied' | 'reserved';
  price: number;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at?: Date;
}

export type CreateParkingInput = Omit<Parking, 'id' | 'created_at'>;
export type UpdateParkingInput = Partial<Omit<Parking, 'id' | 'created_at'>>;
