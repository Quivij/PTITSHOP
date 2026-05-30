import axiosClient from "./axiosClient.ts";

export type Voucher = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  expiryDate: string;
  minOrderValue: number;
  usageLimit: number;
  isPublic: boolean;
  usedCount: number;
  maxUsagePerUser: number;
  assignedDate: string;
};

export const voucherApi = {
  getMyVouchers: async (): Promise<{
    success: boolean;
    vouchers: Voucher[];
    xu: number;
  }> => {
    return await axiosClient.get("/voucher/my");
  },
};
