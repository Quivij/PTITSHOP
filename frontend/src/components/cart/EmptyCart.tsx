import { useNavigate } from "react-router-dom";
import "./EmptyCart.css";

export default function EmptyCart() {
    const navigate = useNavigate();

    const handleContinueShopping = () => {
        navigate("/products");
    };

    return (
        <div className="empty-cart">
            <div className="empty-cart-icon">
                <i className="bi bi-cart-x"></i>
            </div>

            <h2 className="empty-cart-title">Giỏ hàng trống</h2>

            <p className="empty-cart-description">
                Bạn chưa có sản phẩm nào trong giỏ hàng.<br />
                Hãy khám phá và thêm sản phẩm yêu thích vào giỏ hàng nhé!
            </p>

            <button
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
            >
                <i className="bi bi-bag"></i>
                Bắt đầu mua sắm
            </button>
        </div>
    );
}
