import React, { useEffect, useState } from 'react';
import { productApi } from '../../api/productApi.ts';
import { Product } from '../../types/Product.ts';
import { formatPrice } from '../../utils/format.ts';
import ProductCard from '../products/ProductCard.tsx';
import './ProfileComponents.css';

interface ViewedProductsCardProps {
  viewedProducts: string[]; // Array of viewed product IDs
}

const ViewedProductsCard: React.FC<ViewedProductsCardProps> = ({ viewedProducts }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViewedProducts = async () => {
      try {
        setLoading(true);

        // Gọi nhiều API song song
        const responses = await Promise.all(
          viewedProducts.map(productId => productApi.getProductById(productId))
        );

        // Lấy mảng data từ response
        const productsData = responses.map(res => res.data);

        setProducts(productsData);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm đã xem');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (viewedProducts.length > 0) {
      fetchViewedProducts();
    } else {
      setLoading(false);
    }
  }, [viewedProducts]);

  if (loading) {
    return (
      <div className="viewed-products-card">
        <h2>Sản phẩm đã xem</h2>
        <div className="loading-state">
          <i className="bi bi-arrow-clockwise"></i>
          <p>Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="viewed-products-card">
        <h2>Sản phẩm đã xem</h2>
        <div className="error-state">
          <i className="bi bi-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="viewed-products-card">
      <h2>Sản phẩm đã xem</h2>
      {products.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-eye"></i>
          <p>Bạn chưa xem sản phẩm nào</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard 
              key={product._id} 
              product={product}
              formatPrice={formatPrice} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewedProductsCard;