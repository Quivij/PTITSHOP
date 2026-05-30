import { ReviewResponse } from '../types/Review';
import axiosClient from './axiosClient.ts';

interface CreateReviewData {
  orderId: string;
  productId: string;
  rating: number;
  comment: string;
}

export const reviewApi = {
  getReviewsByProduct: (productId: string): Promise<ReviewResponse> => {
    return axiosClient.get(`/products/${productId}/reviews`);
  },

  createReview: (data: CreateReviewData): Promise<any> => {
    return axiosClient.post(`/reviews`, data);
  }
};