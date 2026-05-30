import { CartItem as CartItemType } from "../../types/Cart";
import { formatPrice } from "../../utils/format.ts";
import "./CartItem.css";

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (productId: string, newQuantity: number) => void;
    onRemoveItem: (productId: string) => void;
    checked: boolean;
    onToggle: () => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemoveItem, checked, onToggle }: CartItemProps) {
    const { product, quantity } = item;

    // Tính giá sau giảm giá
    const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
    const totalPrice = discountedPrice * quantity;

    const handleQuantityChange = (newQuantity: number) => {
        onUpdateQuantity(product._id, newQuantity);
    };

    const handleRemove = () => {
        onRemoveItem(product._id);
    };

    return (
        <div className="cart-item">

            <input type="checkbox" className="cart-item-select" checked={checked} onChange={onToggle} />


            <div className="cart-item-image">
                <img
                    src={product.images[0]?.url || '/placeholder-image.jpg'}
                    alt={product.images[0]?.alt || product.name}
                />
            </div>

            <div className="cart-item-details">
                <h3 className="cart-item-name">{product.name}</h3>
                <div className="cart-item-price">
                    <span className="current-price">{formatPrice(discountedPrice)}</span>
                    {product.discount > 0 && (
                        <span className="original-price">{formatPrice(product.price)}</span>
                    )}
                </div>
                {product.discount > 0 && (
                    <span className="discount-badge">-{product.discount}%</span>
                )}
            </div>

            <div className="cart-item-quantity">
                <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                >
                    -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                >
                    +
                </button>
            </div>

            <div className="cart-item-total">
                <span className="total-price">{formatPrice(totalPrice)}</span>
            </div>

            <div className="cart-item-actions">
                <button
                    className="remove-btn"
                    onClick={handleRemove}
                    title="Xóa sản phẩm"
                >
                    <i className="bi bi-trash"></i>
                </button>
            </div>
        </div>
    );
}
