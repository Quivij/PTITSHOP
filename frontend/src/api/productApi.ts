// src/api/productApi.ts
import axiosClient from './axiosClient.ts';

// Có thể define type riêng cho product
import { Category } from '../types/Category.ts';
import type { Product } from '../types/Product';

export const productApi = {
  // Limit mặc định là 6, page mặc định là 1, limit là số sản phẩm tối đa mỗi trang
  getProducts: async (page: number = 1, limit: number = 6, category?: string, keyword: string = "") => {
    const params: any = { page, limit, keyword };
    if (category) params.category = category;

    const res = await axiosClient.get('/products', { params });
    console.log("📦 API response:", res);
    return res;
  },


  getProductById: async (id: string): Promise<{data: Product}> => {
    return await axiosClient.get(`/products/${id}`);
  },

//   getSimilarProducts: async (id: string) => {
//     return await axiosClient.get(`/products/${id}/similar`);
//   },

//   getNewestProducts: async () => {
//     return await axiosClient.get('/newest');
//   },

//   getBestSellers: async () => {
//     return await axiosClient.get('/best-sellers');
//   },

//   createProduct: async (product: Partial<Product>) => {
//     return await axiosClient.post('/create-products', product);
//   }
};
