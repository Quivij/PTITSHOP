## PHẦN 5: TRIỂN KHAI

### 5.1. Cấu trúc thư mục

```
PITITShop/
├── backend/
│   └── src/
│       ├── services/
│       │   └── recommendation/
│       │       └── recommendationService.js   [NEW]
│       ├── controllers/
│       │   └── recommendationController.js    [NEW]
│       └── routes/
│           └── api.js                         [MODIFIED]
│
└── frontend/
    └── src/
        ├── api/
        │   └── recommendationApi.ts            [NEW]
        ├── components/
        │   └── products/
        │       ├── RecommendationSection.tsx   [NEW]
        │       └── RecommendationSection.css   [NEW]
        └── pages/
            ├── auth/
            │   └── HomePage.tsx               [MODIFIED]
            └── products/
                └── ProductDetailPage.tsx      [MODIFIED]
```

### 5.2. Triển khai Backend

#### 5.2.1. recommendationController.js

Controller đóng vai trò làm cầu nối giữa HTTP layer và Service layer, xử lý xác thực đầu vào và định dạng response.

```javascript
import {
  getPersonalizedRecommendations,
  getFrequentlyBoughtTogether,
  getColdStartRecommendations
} from '../services/recommendation/recommendationService.js';

// ── Endpoint 1: Gợi ý cá nhân hóa (yêu cầu đăng nhập) ──────
export const getForYou = async (req, res) => {
  try {
    const userId = req.user?.userId;  // Lấy từ JWT payload
    const limit = parseInt(req.query.limit) || 8;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const products = await getPersonalizedRecommendations(userId, limit);

    return res.status(200).json({
      success: true,
      type: 'personalized',
      data: products
    });
  } catch (error) {
    console.error('getForYou error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Endpoint 2: Sản phẩm phổ biến (public) ──────────────────
export const getPopular = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await getColdStartRecommendations(limit);
    return res.status(200).json({ success: true, type: 'popular', data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Endpoint 3: Thường mua cùng (public) ────────────────────
export const getBoughtTogether = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    const products = await getFrequentlyBoughtTogether(productId, limit);
    return res.status(200).json({ success: true, type: 'bought-together', data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
```

#### 5.2.2. Đăng ký Route (api.js)

```javascript
// Public routes — không cần auth
router.get('/recommendations/popular', getPopular);
router.get('/recommendations/bought-together/:productId', getBoughtTogether);

// Protected routes — sau router.use(auth)
router.use(auth);
router.get('/recommendations/for-you', getForYou);
```

### 5.3. Triển khai Frontend

#### 5.3.1. recommendationApi.ts

```typescript
import axiosClient from './axiosClient';

export const recommendationApi = {
  // Gọi API gợi ý cá nhân hóa (cần token)
  getForYou: (limit = 8) =>
    axiosClient.get(`/recommendations/for-you?limit=${limit}`),

  // Gọi API sản phẩm phổ biến (không cần token)
  getPopular: (limit = 8) =>
    axiosClient.get(`/recommendations/popular?limit=${limit}`),

  // Gọi API thường mua cùng
  getBoughtTogether: (productId: string, limit = 6) =>
    axiosClient.get(`/recommendations/bought-together/${productId}?limit=${limit}`),
};
```

#### 5.3.2. RecommendationSection.tsx — Component giao diện

```tsx
interface Props {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  products: Product[];
  loading: boolean;
  formatPrice: (price: number) => string;
}

// ── Skeleton loading card ────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rec-card rec-card--skeleton">
      <div className="rec-card__img-wrapper skeleton-box" />
      <div className="rec-card__body">
        <div className="skeleton-line skeleton-line--short" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line--medium" />
      </div>
    </div>
  );
}

// ── Product card ─────────────────────────────────────────────
function RecProductCard({ product, formatPrice }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const finalPrice = product.price * (1 - (product.discount ?? 0) / 100);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await cartApi.addToCart(product._id, 1);
    dispatch(refreshCart());
  };

  return (
    <div className="rec-card" onClick={() => navigate(`/products/${product.slug}-${product._id}`)}>
      {/* Ảnh sản phẩm + badges */}
      <div className="rec-card__img-wrapper">
        <img src={product.images?.[0]?.url} alt={product.name} className="rec-card__img" />
        {product.discount > 0 && (
          <span className="rec-card__discount-badge">-{product.discount}%</span>
        )}
        {product.isHot && <span className="rec-card__hot-badge">🔥 Hot</span>}
        {product.isNew && <span className="rec-card__new-badge">✨ Mới</span>}
        {/* Hover overlay */}
        <div className="rec-card__overlay">
          <button className="rec-card__cart-btn" onClick={handleAddToCart}>
            🛒 Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="rec-card__body">
        <p className="rec-card__category">{product.category?.name}</p>
        <h3 className="rec-card__name">{product.name}</h3>
        <div className="rec-card__price-row">
          <span className="rec-card__price">{formatPrice(finalPrice)}</span>
          {product.discount > 0 && (
            <span className="rec-card__original-price">{formatPrice(product.price)}</span>
          )}
        </div>
        <p className="rec-card__sold">Đã bán: {product.sold}</p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function RecommendationSection({
  title, subtitle, badge, badgeColor, products, loading, formatPrice
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ẩn section nếu không có sản phẩm
  if (!loading && products.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'right' ? 320 : -320,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="rec-section">
      <div className="rec-section__header">
        <div className="rec-section__title-group">
          <span className="rec-section__badge" style={{ background: badgeColor }}>
            {badge}
          </span>
          <h2 className="rec-section__title">{title}</h2>
        </div>
        <p className="rec-section__subtitle">{subtitle}</p>
        <div className="rec-section__nav">
          <button onClick={() => scroll('left')}>‹</button>
          <button onClick={() => scroll('right')}>›</button>
        </div>
      </div>

      <div className="rec-section__track" ref={scrollRef}>
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : products.map(p => (
              <RecProductCard key={p._id} product={p} formatPrice={formatPrice} />
            ))
        }
      </div>
    </section>
  );
}
```

#### 5.3.3. Tích hợp vào HomePage.tsx

```tsx
// State
const [recProducts, setRecProducts] = useState<Product[]>([]);
const [recLoading, setRecLoading] = useState(false);
const { token, user } = useSelector((s: RootState) => s.auth);

// Fetch recommendations — trigger khi token thay đổi
useEffect(() => {
  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      let res;
      if (token) {
        // Đảm bảo token có trong localStorage (tránh race condition)
        if (!localStorage.getItem('access_token')) {
          localStorage.setItem('access_token', token);
        }
        res = await recommendationApi.getForYou(8);
      } else {
        res = await recommendationApi.getPopular(8);
      }
      setRecProducts(res?.data || []);
    } catch {
      // Fallback: nếu for-you lỗi → thử popular
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

// JSX
<RecommendationSection
  title={user ? `Dành Cho ${user.fullName?.split(' ').pop()}` : 'Có Thể Bạn Thích'}
  subtitle="Gợi ý dựa trên lịch sử xem và mua hàng của bạn"
  badge={token ? '✨ AI GỢI Ý' : '🔥 Phổ Biến'}
  badgeColor={token ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f97316'}
  products={recProducts}
  loading={recLoading}
  formatPrice={formatPrice}
/>
```

### 5.4. Styling — Dark Glassmorphism

```css
/* Section container */
.rec-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 40px 24px;
  border-radius: 0;
}

/* Product card */
.rec-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  min-width: 200px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.rec-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

/* Hover overlay */
.rec-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rec-card:hover .rec-card__overlay { opacity: 1; }

/* Skeleton shimmer */
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
.skeleton-box {
  background: linear-gradient(90deg, #2a2a4a 25%, #3a3a5a 50%, #2a2a4a 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
```

---
