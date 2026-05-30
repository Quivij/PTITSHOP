import axiosClient from './axiosClient.ts';

interface CreateQrPayload {
  items: string[];
  voucherCode?: string | null;
  usedXu?: number;
}

interface CreateQrResponse {
  success: boolean;
  url: string;
}

export const paymentApi = {
  createQr: async (payload: CreateQrPayload): Promise<CreateQrResponse> => {
    return await axiosClient.post('/payment/create-qr', payload);
  },
};
