import axiosClient from './axiosClient.ts';
import type { ProfileResponse } from '../types/User';
import { ReviewResponse } from '../types/Review.ts';

export const profileApi = {
    getProfile: async (): Promise<ProfileResponse> => {
        return await axiosClient.get('/profile');
    },

    updateProfile: async (data: Partial<ProfileResponse['data']>): Promise<ProfileResponse> => {
        return await axiosClient.put('/update-profile', data);
    },

    uploadAvatar: async (file: File): Promise<{ success: boolean; data: { avatarUrl: string } }> => {
        const formData = new FormData();
        formData.append('avatar', file);
        return await axiosClient.post('/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    addToViewedProducts: async (productId: string): Promise<{ success: boolean, message: string }> => {
        return await axiosClient.post('/user/viewed-products', { productId });
    },
    toggleFavoriteProduct: (productId: string): Promise<{ success: boolean, message: string }> => {
        return axiosClient.post('/user/favorite-products', { productId });
    },

    getUserStats: async (): Promise<{ success: boolean, data: { reviews: number, orders: number } }> => {
        try {
            const [reviewsResponse, ordersResponse] = await Promise.all([
                axiosClient.get('/reviews'),
                axiosClient.get('/orders/count')
            ]);

            return {
                success: true,
                data: {
                    reviews: reviewsResponse.data?.length || reviewsResponse.data?.count || 0,
                    orders: ordersResponse.data?.count || ordersResponse.data?.data?.count || 0
                }
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return {
                success: false,
                data: {
                    reviews: 0,
                    orders: 0
                }
            };
        }
    },

    getUserReviews: async (): Promise<ReviewResponse> => {
        return await axiosClient.get('/reviews');
    },
};
