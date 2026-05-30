import React, { useEffect, useState } from 'react';
import { Product } from '../../types/Product.ts';
import ProductCard from '../products/ProductCard.tsx';
import './ProfileComponents.css';
import { productApi } from '../../api/productApi.ts';
import { formatPrice } from '../../utils/format.ts';

interface FavoritesCardProps {
  favProducts: string[]; // Array of product IDs
}

const FavoritesCard: React.FC<FavoritesCardProps> = ({ favProducts }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
        try {
        setLoading(true);

        // Gọi nhiều API song song
        const responses = await Promise.all(
            favProducts.map(productId => productApi.getProductById(productId))
        );

        // Lấy mảng data từ response
        const productsData = responses.map(res => res.data);

        setProducts(productsData);
        } catch (err) {
        setError('Không thể tải danh sách sản phẩm yêu thích');
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    if (favProducts.length > 0) {
        fetchFavoriteProducts();
    } else {
        setLoading(false);
    }
    }, [favProducts]);


  if (loading) {
    return (
      <div className="favorites-card">
        <h2>Sản phẩm yêu thích</h2>
        <div className="loading-state">
          <i className="bi bi-arrow-clockwise"></i>
          <p>Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-card">
        <h2>Sản phẩm yêu thích</h2>
        <div className="error-state">
          <i className="bi bi-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-card">
      <h2>Sản phẩm yêu thích</h2>
      {products.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-heart"></i>
          <p>Bạn chưa có sản phẩm yêu thích nào</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product._id} product={product}
            formatPrice={formatPrice} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesCard;