import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store.ts";
import ProductsSection from "../../components/products/ProductsSection.tsx";
import RecommendationSection from "../../components/products/RecommendationSection.tsx";
import { Product } from "../../types/Product.ts";
import "./HomePage.css";
import { productApi } from "../../api/productApi.ts";
import { CategoryApi } from "../../api/categoryApi.ts";
import { Category } from "../../types/Category.ts";
import SearchBar from "../../components/layout/searchBar.tsx";
import { recommendationApi } from "../../api/recommendationApi.ts";



export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategory] = useState<Category[]>([]);
  const [recProducts, setRecProducts] = useState<Product[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const { user, token } = useSelector((state: RootState) => state.auth);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category.name === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(keyword.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

    useEffect(() => {
      console.log("🔥 useEffect triggered:", { selectedCategory, keyword });
    const fetchProducts = async () => {
      try {
        const params: any = { page: 1, limit: 6, category: selectedCategory, keyword: keyword };
        if (selectedCategory !== "") params.category = selectedCategory;
        if (keyword.trim()) params.keyword = keyword;

        const response = await productApi.getProducts(params.page, params.limit, params.category, keyword);
        console.log("Fetched products:", response.data);
        setProducts(response.data|| []);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      }
    };
    fetchProducts();
  }, [selectedCategory, keyword]);

  // ✅ load categories 1 lần
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await CategoryApi.getCategories();
      setCategory(response || []);
      console.log("Categories fetched:", response);
    };
    fetchCategories();
  }, []);

  // ✅ load recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      setRecLoading(true);
      try {
        let res;
        if (token) {
          // Đảm bảo token đã được ghi vào localStorage trước khi gọi API
          // (tránh race condition với interceptor của axiosClient)
          const storedToken = localStorage.getItem("access_token");
          if (!storedToken) {
            localStorage.setItem("access_token", token);
          }
          res = await recommendationApi.getForYou(8);
        } else {
          // Chưa đăng nhập → dùng popular (cold start)
          res = await recommendationApi.getPopular(8);
        }
        setRecProducts(res?.data || []);
      } catch (err) {
        console.error("Lỗi tải gợi ý:", err);
        // Fallback: nếu for-you lỗi, thử popular
        try {
          const fallback = await recommendationApi.getPopular(8);
          setRecProducts(fallback?.data || []);
        } catch {
          setRecProducts([]);
        }
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommendations();
  }, [token]);


  const handleSearch = (keyword: string) => {
    setKeyword(keyword);
  };
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Chào mừng đến với <span className="highlight">PTITShop</span>
            </h1>
            <p className="hero-subtitle">
              Khám phá bộ sưu tập độc quyền
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Sản phẩm</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Khách hàng</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Đánh giá</span>
              </div>
            </div>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">
                Khám phá ngay
              </Link>
              <Link to="/about" className="btn btn-outline">
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop" 
              alt="PTITShop Collection"
            />
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-container">
            <SearchBar onSearch={handleSearch} /> 
            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className={`category-btn ${selectedCategory === category._id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category._id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      {/* <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản phẩm nổi bật</h2>
            <p className="section-subtitle">
              Bộ sưu tập độc quyền với thiết kế đẹp mắt và chất lượng cao
            </p>
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  {product.isNew && <span className="badge badge-new">Mới</span>}
                  {product.isHot && <span className="badge badge-hot">Hot</span>}
                  <div className="product-actions">
                    <button className="action-btn wishlist-btn">
                      <i className="bi bi-heart"></i>
                    </button>
                    <button className="action-btn quick-view-btn">
                      <i className="bi bi-eye"></i>
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-category">{product.category}</div>
                  <div className="product-price">
                    <span className="current-price">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  <button className="btn btn-add-cart">
                    <i className="bi bi-cart-plus"></i>
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <i className="bi bi-search"></i>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
            </div>
          )}
        </div>
      </section> */}
      <ProductsSection
        title="Sản phẩm nổi bật"
        subtitle="Bộ sưu tập độc quyền với thiết kế đẹp mắt và chất lượng cao"
        products={products}
        formatPrice={formatPrice}
      />

      {/* Recommendation Section */}
      <div style={{ padding: "0 16px" }}>
        <RecommendationSection
          title={token ? `Dành Cho ${user?.fullName?.split(" ").pop() || "Bạn"}` : "Có Thể Bạn Thích"}
          subtitle={token ? "Gợi ý dựa trên lịch sử xem và mua hàng của bạn" : "Sản phẩm phổ biến được nhiều người yêu thích"}
          badge={token ? "✨ AI Gợi Ý" : "🔥 Phổ Biến"}
          badgeColor={token ? "#7c3aed" : "#f97316"}
          products={recProducts}
          loading={recLoading}
          formatPrice={formatPrice}
        />
      </div>


      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-truck"></i>
              </div>
              <h3>Miễn phí vận chuyển</h3>
              <p>Cho đơn hàng từ 500K</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-shield-check"></i>
              </div>
              <h3>Chất lượng đảm bảo</h3>
              <p>100% chính hãng PTIT</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-arrow-clockwise"></i>
              </div>
              <h3>Đổi trả dễ dàng</h3>
              <p>30 ngày đổi trả</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-headset"></i>
              </div>
              <h3>Hỗ trợ 24/7</h3>
              <p>Hotline: 1900-PTIT</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Đăng ký nhận thông báo</h2>
            <p>Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="newsletter-input"
              />
              <button className="btn btn-primary">Đăng ký</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
