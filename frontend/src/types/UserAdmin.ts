export interface User {
  id?: string;
  _id?: any;
  fullName: string;
  username?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  gender?: boolean | null;
  dateOfBirth?: string | Date | { $date?: string };
  avt?: string | null;
  role?: "USER" | "ADMIN";
  isAdmin?: boolean;
  isActive: boolean;
  xu?: number;
  createdAt?: string | Date | { $date?: string };
  updatedAt?: string | Date | { $date?: string };
  address?: string;
  note?: string;
}