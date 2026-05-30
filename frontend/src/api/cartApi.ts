import { CartResponse } from '../types/Cart';
import axiosClient from './axiosClient.ts';

export const cartApi = {
    getCart: async (): Promise<CartResponse> => {
        return await axiosClient.get('/cart');
    },

    updateQuantity: async (productId: string, quantity: number): Promise<CartResponse> => {
        return await axiosClient.put('/cart/update', { productId, quantity });
    },

    removeItem: async (productId: string): Promise<CartResponse> => {
        return await axiosClient.delete(`/cart/remove/${productId}`);
    },

    clearCart: async (): Promise<CartResponse> => {
        return await axiosClient.delete('/cart/clear');
    },

    addToCart: async (productId: string, quantity: number = 1): Promise<CartResponse> => {
        return await axiosClient.post('/cart/add', { productId, quantity });
    }
}