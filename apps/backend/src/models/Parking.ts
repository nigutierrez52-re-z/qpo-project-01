export interface Parking {
  id: number;
  spot_num: string;
  status: 'available' | 'occupied' | 'reserved';
  price: number;
  description?: string;
}

export type CreateParkingInput = Omit<Parking, 'id'>;
export type UpdateParkingInput = Partial<Omit<Parking, 'id'>>;
