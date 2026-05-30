// src/types/Orders.ts
import { DeliveryAddress } from './deliveryAddress';

export interface OrderUser {
  _id: string;
  username: string;
  email: string;
}
export interface ProductImage {
  _id: string;
  url: string;
  alt: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  discount: number;
  images: ProductImage[];
  slug: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  isCommented: boolean;
}

export interface PaymentInfo {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export interface Order {
  _id: string;
  user: OrderUser;
  items: OrderItem[];
  totalPrice: number;
  status: string;        // "paid", "pending", ...
  statusOrder: string;   // "pending", ...
  isDelivered: boolean;
  usedXu: number;
  deliveryAddressId: DeliveryAddress; // Thông tin địa chỉ giao hàng đầy đủ
  createdAt: string;
  updatedAt: string;
  __v: number;
  paymentInfo: PaymentInfo;
}

// Kiểu cho phản hồi API /v1/api/orders
export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
  };
}
