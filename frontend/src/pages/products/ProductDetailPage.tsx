import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { cartApi } from "../../api/cartApi.ts";
import { CategoryApi } from "../../api/categoryApi.ts";
import { productApi } from "../../api/productApi.ts";
import CommentsSection from "../../components/comments/CommentsSetion.tsx";
import ProductsSection from "../../components/products/ProductsSection.tsx";
import { Product } from "../../types/Product";
import { formatPrice } from "../../utils/format.ts";
import "./ProductDetailPage.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store.ts";
import { profileApi } from "../../api/profileApi.ts";
import { toggleFavoriteProduct } from "../../redux/authSlice.ts";
import { toast, ToastContainer } from "react-toastify";
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProduct, setRelatedProduct] = useState<Product[] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // Tính toán isFavorite trực tiếp từ Redux state
  const isFavorite = product && user ? user.favProducts.includes(product._id) : false;

  //const product = mockProducts.find((p) => p.id === Number(id));
  const navigate = useNavigate();
  // Check if product is in favorites when component mounts or product/user changes

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await cartApi.addToCart(product._id, quantity);
      navigate("/cart");
    } catch (error) {
      console.error("❌ Lỗi khi thêm vào giỏ:", error);
      alert("Thêm vào giỏ hàng thất bại");
    }
  };
  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        const id = slug.split("-").pop() as string;
        console.log("product slug and id: ", slug, id)
        const res = await productApi.getProductById(id);
        setProduct(res.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [slug]);
  // Không cần useEffect để set isFavorite nữa vì đã tính toán trực tiếp

  useEffect(() => {
    if (!product) return; // tránh gọi khi product chưa có

    const fetchRelatedProduct = async () => {
      try {
        const slug = `${product.category.name}-${product.category._id}`;
        const res = await CategoryApi.getProductsByCategoryPagination(slug);
        setRelatedProduct(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRelatedProduct();
  }, [product?.category?._id]);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!product) {
    return <div className="p-4">❌ Không tìm thấy sản phẩm</div>;
  }

  const increment = () => {
    if (quantity < (product.quantity || 1)) setQuantity(quantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };


  const handleToggleFavorite = async () => {
    if (!product || !user) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích");
      return;
    }

    try {
      await profileApi.toggleFavoriteProduct(product._id);
      // Cập nhật Redux state ngay lập tức
      dispatch(toggleFavoriteProduct(product._id));
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Không thể thêm/xóa khỏi danh sách yêu thích");
    }
  };

  return (
    <div>
      <div className="product-detail-container">
        {/* Swiper hình ảnh */}
        <div className="product-image">
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            modules={[Autoplay]}
          >
            {product.images?.map((img, index) => (
              <SwiperSlide key={index}>
                <img src={img.url} alt={`${product.name} ${index + 1}`} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>

          {product.discount ? (
            <div className="price-box">
              <span className="price">{formatPrice(product.price * (1 - product.discount / 100))}</span>
              <span className="original-price">{formatPrice(product.price)}</span>
              <span className="discount">-{product.discount}%</span>
            </div>
          ) : (
            <p className="price">{formatPrice(product.price)}</p>
          )}

          <p><strong>Danh mục:</strong> {product.category.name}</p>
          <p><strong>Đã bán:</strong> {product.sold}</p>
          <p><strong>Lượt xem:</strong> {product.views}</p>
          <p><strong>Ngày thêm:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
          <p><strong>Tồn kho:</strong> {product.quantity}</p>

          {/* Chọn số lượng */}
          <div className="quantity-selector">
            <button onClick={decrement}>-</button>
            <span>{quantity}</span>
            <button onClick={increment}>+</button>
          </div>

          {/* Nút thêm vào giỏ */}
          <button className="btn-add-cart" onClick={handleAddToCart}>
            🛒 Thêm {quantity} vào giỏ
          </button>
        </div>
        <div className="action-buttons">
          <button
            className={`btn-favorite ${isFavorite ? 'active' : ''}`}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      <CommentsSection productId={product._id} />
      <ProductsSection
        title="Sản phẩm liên quan"
        products={relatedProduct ?? []}
        subtitle=""
        formatPrice={formatPrice}
      />

      {/* <ToastContainer 
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      /> */}
    </div>
  );
}