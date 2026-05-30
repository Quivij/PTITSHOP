import React from "react";
import { useCart } from "../../hooks/useCart.ts";

interface AddToCartButtonProps {
    productId: string;
    quantity?: number;
    className?: string;
    children?: React.ReactNode;
}

export default function AddToCartButton({
    productId,
    quantity = 1,
    className = "btn btn-primary",
    children = "Thêm vào giỏ"
}: AddToCartButtonProps) {
    const { addToCart, loading } = useCart();

    const handleAddToCart = async () => {
        try {
            await addToCart(productId, quantity);
            // Có thể thêm toast notification ở đây
            console.log('Đã thêm vào giỏ hàng');
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
        }
    };

    return (
        <button
            className={className}
            onClick={handleAddToCart}
            disabled={loading}
        >
            {loading ? (
                <>
                    <i className="bi bi-arrow-clockwise"></i>
                    Đang thêm...
                </>
            ) : (
                children
            )}
        </button>
    );
}
