import axiosClient from "./axiosClient.ts";
import type { ApiAddProductResponse, ApiProductResponse, CreateProductPayload, Product, UpdateProductPayload } from "../types/Product";

export const adminProductApi = {
  // Lấy danh sách sản phẩm có phân trang (dành cho admin)
  getProducts: async (page: number = 1, limit: number = 10, category?: string, keyword?: string) : Promise<ApiProductResponse<Product[]>>=> {
    const params: any = { page, limit };
    if (category && category !== "all") params.category = category;
    if (keyword) params.keyword = keyword;

    return await axiosClient.get("/admin/products", { params });
  },

  addProduct: async (data: CreateProductPayload) : Promise<ApiAddProductResponse<Product>>=> {
    return await axiosClient.post("/admin/products", data);
  },

  updateProduct: async (id: string, data: UpdateProductPayload) : Promise<ApiAddProductResponse<Product>> => {
    return await axiosClient.put(`/admin/products/${id}`, data);
  },

  deleteProduct: async (id: string) : Promise<ApiAddProductResponse<Product>> => {
    return await axiosClient.delete(`/admin/products/${id}`);
  },

  

};
