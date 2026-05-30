import { Product } from "./Product";
import { User } from "./User";

export interface Review {
  _id: string;
  product: Product;
  user: User;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  success: boolean;
  count: number;
  data: Review[];
  message?: string;
  error?: string;
}