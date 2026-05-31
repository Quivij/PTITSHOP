import axiosClient from './axiosClient.ts';
import { Product } from '../types/Product';

export interface RecommendationResponse {
  success: boolean;
  data: Product[];
  type: 'personalized' | 'popular' | 'bought-together';
}

export const recommendationApi = {
  /** Gợi ý cá nhân hóa cho user đang đăng nhập */
  getForYou: async (limit: number = 8): Promise<RecommendationResponse> => {
    const res = await axiosClient.get('/recommendations/for-you', {
      params: { limit },
    });
    return res as any;
  },

  /** Sản phẩm thường mua cùng (Item Co-occurrence) */
  getBoughtTogether: async (
    productId: string,
    limit: number = 6
  ): Promise<RecommendationResponse> => {
    const res = await axiosClient.get(
      `/recommendations/bought-together/${productId}`,
      { params: { limit } }
    );
    return res as any;
  },

  /** Sản phẩm phổ biến — dành cho user chưa đăng nhập (cold start) */
  getPopular: async (limit: number = 8): Promise<RecommendationResponse> => {
    const res = await axiosClient.get('/recommendations/popular', {
      params: { limit },
    });
    return res as any;
  },
};
