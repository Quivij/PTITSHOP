import { OrderResponse } from '../types/Order';
import axiosClient from './axiosClient.ts';

export const orderApi = {
    getOrder: async (status?: string): Promise<OrderResponse> => {
        // status là optional, nếu có thì thêm vào query
        const url = status ? `/orders?status=${status}` : '/orders';
        return await axiosClient.get(url);
    },
    updateStatus: async (orderId: string, statusOrder: string) => {
        return axiosClient.put(`/orders/${orderId}/status`, { statusOrder });
    },

    
}