export enum Role {
  ADMIN = 'admin',
  STAFF = 'staff',
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  password?: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}