export interface Reservation {
  id: number;
  user_id: number;
  spot_id: number;
  start_time: Date;
  end_time?: Date;
  total_price?: number;
  status: 'active' | 'completed' | 'cancelled';
}

export type CreateReservationInput = Omit<Reservation, 'id'>;
export type UpdateReservationInput = Partial<Omit<Reservation, 'id'>>;
