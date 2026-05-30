import ProductCard from "./ProductCard.tsx";
import { Product } from "../../types/Product.ts";
import "./Product.css";

interface ProductsSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  formatPrice: (price: number) => string;
}

export default function ProductsSection({
  title,
  subtitle,
  products,
  formatPrice,
}: ProductsSectionProps) {
  return (
    <section className="products-section">
      <div className="product-container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              formatPrice={formatPrice}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="no-products">
            <i className="bi bi-search"></i>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
          </div>
        )}
      </div>
    </section>
  );
}
