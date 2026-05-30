import axiosClient from "./axiosClient.ts";
import { Order } from "../types/Order.ts";

export const adminOrderApi = {
  // Lấy danh sách đơn hàng
  getOrders: async (status?: string) => {
    const params: any = {};
    if (status) params.status = status;

    const res = await axiosClient.get<{ orders: Order[] }>(
      "/admin/orders",
      { params }
    );

    return res.data?.orders ?? [];
  },


  // Cập nhật trạng thái đơn hàng
  updateStatus: async (orderId: string, newStatusOrder: string) => {
    const res = await axiosClient.put<{ data: Order }>(
      `/admin/orders/${orderId}/status`,
      { newStatusOrder }
    );
    return res.data;
  },

  getOrdersByUserId: async (userId: string) => {
    const res = await axiosClient.get<{
      success: boolean;
      message: string;
      data: { orders: Order[] };
    }>(`/orders/user/${userId}`);

    return res.data ?? [];
  },
};
