
import { ApiCategoryResponse, Category } from '../types/Category.ts';
import { Product } from '../types/Product';
import axiosClient from './axiosClient.ts';

export const CategoryApi = {
    getCategories: async (): Promise<Category[]> => {
    return await axiosClient.get('/categories');
  },
    // Lấy chi tiết 1 category theo id hoặc slug
  getCategoryDetail: async (idOrSlug: string): Promise<Category> => {
    return await axiosClient.get(`/categories/${idOrSlug}`);
  },

  // Lấy sản phẩm theo category (slug)
  getProductsByCategoryPagination: async (
    slug: string,
    page: number = 1,
    limit: number = 6
  ): Promise<{ data: Product[]; pagination: { totalPages: number } }> => {
    return await axiosClient.get(
      `/products?category=${slug}&page=${page}&limit=${limit}`
    );
  },

  addCategory: async (data: Partial<Category>): Promise<ApiCategoryResponse<Category>> => {
    return await axiosClient.post("/admin/categories", data);
  },

}
