export interface DeliveryAddress {
    _id: string;
    addressName: string;
    defaultAddress: boolean;
    nameBuyer: string;
    buyerId: string;
    phoneNumber?: string;
    note?: string;
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
}

export interface CreateAddressPayload {
    addressName: string;
    nameBuyer: string;
    phoneNumber?: string;
    note?: string;
    defaultAddress?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}