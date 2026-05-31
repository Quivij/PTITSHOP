import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi } from "../../api/cartApi.ts";
import { profileApi } from "../../api/profileApi.ts";
import { Product } from "../../types/Product";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import "./RecommendationSection.css";

interface RecommendationSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  loading?: boolean;
  badge?: string;         // ví dụ: "AI Gợi Ý", "Hay Mua Cùng"
  badgeColor?: string;    // ví dụ: "#7c3aed", "#0ea5e9"
  formatPrice: (price: number) => string;
  emptyText?: string;
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rec-card rec-skeleton">
      <div className="rec-card__image-wrap rec-shimmer" />
      <div className="rec-card__body">
        <div className="rec-shimmer rec-skel-line" style={{ width: "80%" }} />
        <div className="rec-shimmer rec-skel-line" style={{ width: "50%", marginTop: 8 }} />
        <div className="rec-shimmer rec-skel-btn" />
      </div>
    </div>
  );
}

// ─── Product Card (Rec) ────────────────────────────────────────────────────
function RecProductCard({
  product,
  formatPrice,
}: {
  product: Product;
  formatPrice: (price: number) => string;
}) {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleClick = async () => {
    if (token) {
      try {
        await profileApi.addToViewedProducts(product._id);
      } catch (_) {}
    }
    navigate(`/products/${product.slug || "product"}-${product._id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    try {
      await cartApi.addToCart(product._id, 1);
      toast.success("Đã thêm vào giỏ hàng");
    } catch {
      toast.error("Thêm vào giỏ hàng thất bại");
    }
  };

  return (
    <div className="rec-card" onClick={handleClick}>
      <div className="rec-card__image-wrap">
        <img
          src={product.images?.[0]?.url || "/placeholder-image.jpg"}
          alt={product.name}
          className="rec-card__img"
        />
        {product.discount > 0 && (
          <span className="rec-card__discount-badge">-{product.discount}%</span>
        )}
        {product.isHot && <span className="rec-card__hot-badge">🔥 Hot</span>}
        {product.isNew && (
          <span className="rec-card__new-badge">✨ Mới</span>
        )}
        <div className="rec-card__overlay">
          <button className="rec-card__cart-btn" onClick={handleAddToCart}>
            🛒 Thêm vào giỏ
          </button>
        </div>
      </div>

      <div className="rec-card__body">
        <p className="rec-card__category">{product.category?.name}</p>
        <h3 className="rec-card__name">{product.name}</h3>
        <div className="rec-card__price-row">
          <span className="rec-card__price">{formatPrice(finalPrice)}</span>
          {product.discount > 0 && (
            <span className="rec-card__original-price">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        {product.sold > 0 && (
          <p className="rec-card__sold">Đã bán: {product.sold}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function RecommendationSection({
  title,
  subtitle,
  products,
  loading = false,
  badge,
  badgeColor = "#7c3aed",
  formatPrice,
  emptyText = "Chưa có gợi ý nào",
}: RecommendationSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="rec-section">
      <div className="rec-section__header">
        <div className="rec-section__title-group">
          {badge && (
            <span
              className="rec-section__badge"
              style={{ background: badgeColor }}
            >
              {badge}
            </span>
          )}
          <h2 className="rec-section__title">{title}</h2>
        </div>
        {subtitle && <p className="rec-section__subtitle">{subtitle}</p>}

        <div className="rec-section__nav">
          <button
            className="rec-section__nav-btn"
            onClick={() => scroll("left")}
            aria-label="Cuộn trái"
          >
            ‹
          </button>
          <button
            className="rec-section__nav-btn"
            onClick={() => scroll("right")}
            aria-label="Cuộn phải"
          >
            ›
          </button>
        </div>
      </div>

      <div className="rec-section__track" ref={scrollRef}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((p) => (
              <RecProductCard
                key={p._id}
                product={p}
                formatPrice={formatPrice}
              />
            ))}
      </div>
    </section>
  );
}
