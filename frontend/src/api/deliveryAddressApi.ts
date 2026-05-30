import { ApiResponse, CreateAddressPayload, DeliveryAddress, UpdateAddressPayload } from "../types/deliveryAddress";
import axiosClient from "./axiosClient.ts";


export const deliveryAddressApi = {
    getAll: (): Promise<ApiResponse<DeliveryAddress[]>> => {
        const url = '/user/delivery-addresses';
        return axiosClient.get(url);
    },

    create: (payload: CreateAddressPayload): Promise<ApiResponse<DeliveryAddress>> => {
        const url = '/user/delivery-addresses';
        return axiosClient.post(url, payload);
    },

    update: (id: string, payload: UpdateAddressPayload): Promise<ApiResponse<DeliveryAddress>> => {
        const url = `/user/delivery-addresses/${id}`;
        return axiosClient.put(url, payload);
    },

    setDefault: (id: string): Promise<ApiResponse<DeliveryAddress>> => {
        const url = `/user/delivery-addresses/${id}/default`;
        return axiosClient.put(url);
    },

    delete: (id: string): Promise<ApiResponse<DeliveryAddress>> => {
        const url = `/user/delivery-addresses/${id}`;
        return axiosClient.delete(url);
    },
};