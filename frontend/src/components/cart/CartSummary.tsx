import React from "react";
import { formatPrice } from "../../utils/format.ts";
import "./CartSummary.css";

interface CartSummaryProps {
    totalItems: number;       // Tổng số sản phẩm đã chọn
    totalPrice: number;       // Tổng tiền trước giảm giá
    discount?: number;        // Tiền giảm
    onCheckout: () => void;
    onContinueShopping?: () => void;
}

export default function CartSummary({
    totalItems,
    totalPrice,
    discount = 0,
    onCheckout,
    onContinueShopping
}: CartSummaryProps) {
    // const priceAfterDiscount = Math.max(0, totalPrice - discount);
    // const shippingFee = priceAfterDiscount > 500000 ? 0 : 30000;
    const shippingFee = totalPrice > 500000 ? 0 : 30000;

    return (
        <div className="cart-summary">
            <h3 className="summary-title">Tóm tắt đơn hàng</h3>

            <div className="summary-details">
                <div className="summary-row">
                    <span>Tổng sản phẩm:</span>
                    <span>{totalItems} sản phẩm</span>
                </div>

                <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(totalPrice)}</span>
                </div>

                {discount > 0 && (
                    <div className="summary-row discount-row">
                        <span>Giảm giá:</span>
                        <span>-{formatPrice(discount)}</span>
                    </div>
                )}

                <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span className="shipping-fee">
                        {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                    </span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                    <span>Tổng cộng:</span>
                    <span className="total-amount">
                        {formatPrice(totalPrice + shippingFee)}
                    </span>
                </div>
            </div>

            <div className="summary-actions">
                <button
                    className="checkout-btn"
                    onClick={onCheckout}
                    disabled={totalItems === 0}
                >
                    <i className="bi bi-credit-card"></i> Thanh toán
                </button>

                <button
                    className="continue-shopping-btn"
                    onClick={onContinueShopping}
                >
                    <i className="bi bi-arrow-left"></i> Tiếp tục mua sắm
                </button>
            </div>

            {shippingFee === 0 && (
                <div className="free-shipping-notice">
                    <i className="bi bi-truck"></i>
                    <span>Bạn được miễn phí vận chuyển!</span>
                </div>
            )}
        </div>
    );
}
