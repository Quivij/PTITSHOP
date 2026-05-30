import { Product } from "../types/Product.ts";
import axiosClient from "./axiosClient.ts";


export const getRevenueStats = async (
  from: string,
  to: string,
  groupBy: "day" | "month"
) => {
  const res = await axiosClient.get(`/admin/stats/revenue`, {
    params: { from, to, groupBy },
  });
  return res.data;
};

export const getNewUsers = async (
    from: string,
    to: string,
    groupBy: "day" | "month"
) => {
    const res = await axiosClient.get("/admin/stats/users", {
        params: { from, to, groupBy },
    });
    return res.data;
}


export const get10BestSellerProducts = async () => {
    const res = await axiosClient.get<Product[]>("/best-sellers", {
        params: { limit: 10 },
    });
    console.log(res)
    return res;
}

export const getAllUsers = async (page = 1, limit = 5, keyword = "") => {
  const res = await axiosClient.get("/admin/users", {
    params: { page, limit, keyword },
  });
  return res;
};

export const toggleUserActive = async (userId: string, isActive: boolean) => {
  const res = await axiosClient.put(`/admin/users/${userId}/active`, {
    isActive,
  });
  return res.data;
};


export const adminUpdateUserProfile = async (userId: string, data: any) => {
  const res = await axiosClient.put(`/admin/users/${userId}/update`, data);
  return res.data;
};



