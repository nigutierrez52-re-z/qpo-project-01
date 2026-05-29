export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'conductor' | 'anfitrión' | 'user';
  created_at?: Date;
}

export type CreateUserInput = Omit<User, 'id' | 'created_at'>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'created_at'>>;