export interface CartItem {
    product: {
        _id: string;
        name: string;
        price: number;
        discount: number;
        images: {
            _id: string;
            url: string;
            alt?: string;
        }[];
    };
    quantity: number;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
}

export interface CartResponse {
    success: boolean;
    message: string;
    data: {
        items: CartItem[];
        totalItems: number;
        totalPrice: number;
    };
}
