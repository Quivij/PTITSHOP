# BÁO CÁO CHỨC NĂNG: HỆ THỐNG GỢI Ý SẢN PHẨM
## (Recommendation System — PITITShop)

---

## 1. TỔNG QUAN

### 1.1. Mục tiêu

Hệ thống gợi ý sản phẩm được xây dựng nhằm:

- **Tăng trải nghiệm người dùng** — Tự động đề xuất sản phẩm phù hợp với sở thích từng cá nhân, thay vì hiển thị danh sách sản phẩm tĩnh cho tất cả mọi người.
- **Tăng doanh thu** — Gợi ý sản phẩm thường mua cùng nhau giúp tăng giá trị đơn hàng trung bình.
- **Giữ chân người dùng** — Nội dung cá nhân hóa khiến người dùng dành nhiều thời gian hơn trên nền tảng.
- **Khám phá sản phẩm** — Giúp người dùng tìm thấy sản phẩm phù hợp mà họ chưa chủ động tìm kiếm.

### 1.2. Phạm vi triển khai

| Điểm hiển thị | Loại gợi ý |
|---|---|
| Trang chủ (HomePage) | Cá nhân hóa (Personalized) hoặc Phổ biến (Cold Start) |
| Trang chi tiết sản phẩm (ProductDetailPage) | Thường mua cùng nhau (Co-occurrence) |

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│                                                             │
│  HomePage          ProductDetailPage                        │
│  ┌─────────────┐   ┌──────────────────┐                    │
│  │"Dành Cho    │   │"Thường Mua Cùng  │                    │
│  │  [Tên User]"│   │   Nhau"          │                    │
│  │  RecommendationSection.tsx         │                    │
│  └─────┬───────┘   └────────┬─────────┘                    │
│        │                    │                               │
│        └──────────┬─────────┘                               │
│                   │  recommendationApi.ts (Axios)           │
└───────────────────┼─────────────────────────────────────────┘
                    │ HTTP Request (Bearer Token)
┌───────────────────┼─────────────────────────────────────────┐
│                   │       BACKEND (Node.js + Express)        │
│                   │                                         │
│        recommendationController.js                          │
│        ┌──────────┴──────────────────────────┐             │
│        │                                     │             │
│  GET /recommendations/for-you          GET /recommendations │
│  GET /recommendations/popular          /bought-together/:id │
│        │                                     │             │
│        └──────────┬──────────────────────────┘             │
│                   │                                         │
│        recommendationService.js                             │
│        ┌──────────┴────────────────────┐                   │
│        │ MongoDB Aggregation Pipeline  │                   │
│        │ User │ Order │ Product        │                   │
│        └───────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2. Các file đã tạo/sửa

**Backend:**

| File | Vai trò |
|---|---|
| `backend/src/services/recommendation/recommendationService.js` | Logic thuật toán (mới tạo) |
| `backend/src/controllers/recommendationController.js` | Xử lý request/response (mới tạo) |
| `backend/src/routes/api.js` | Đăng ký 3 API endpoint mới |

**Frontend:**

| File | Vai trò |
|---|---|
| `frontend/src/api/recommendationApi.ts` | API client gọi backend (mới tạo) |
| `frontend/src/components/products/RecommendationSection.tsx` | UI Component (mới tạo) |
| `frontend/src/components/products/RecommendationSection.css` | Styles (mới tạo) |
| `frontend/src/pages/auth/HomePage.tsx` | Tích hợp section gợi ý (sửa) |
| `frontend/src/pages/products/ProductDetailPage.tsx` | Tích hợp section mua kèm (sửa) |

---

## 3. THUẬT TOÁN GỢI Ý

Hệ thống sử dụng **kết hợp 3 thuật toán** chạy thuần trên MongoDB Aggregation Pipeline — không cần thư viện AI/ML bên ngoài.

### 3.1. Thuật toán 1: Personalized Recommendation (Cá nhân hóa)

**Áp dụng:** Trang chủ, khi user đã đăng nhập và có lịch sử hành vi.

**Nguồn dữ liệu đầu vào:**
- `user.viewedProducts` — Danh sách sản phẩm đã xem
- `user.favProducts` — Danh sách sản phẩm yêu thích
- `order.items` — Lịch sử sản phẩm đã mua

**Luồng xử lý:**

```
Bước 1: Thu thập tất cả ID sản phẩm đã tương tác
        (viewed + fav + purchased) → interactedIds[]

Bước 2: Content-Based Analysis
        → Đếm tần suất xuất hiện của từng category
        → Tìm 3 category ưa thích nhất
        → Tính khoảng giá trung bình ±40%

Bước 3: Collaborative Filtering
        → Tìm users khác có sản phẩm giao nhau
          với interactedIds của user hiện tại
        → Thu thập sản phẩm mà những user đó thích
          (nhưng user hiện tại chưa xem)

Bước 4: Tính điểm tổng hợp cho từng sản phẩm
        score = +3 (cùng category ưa thích)
              + +2 (trong khoảng giá ưa thích)
              + +2 (là sản phẩm collaborative)
              + views/100 (điểm phổ biến)
              + sold/50  (điểm bán chạy)

Bước 5: Sắp xếp theo score giảm dần → top-N
        Loại bỏ sản phẩm đã tương tác
```

**Công thức điểm:**
```
score(u, i) = α·categoryMatch + β·priceMatch + γ·collaborative + δ·popularity
```

### 3.2. Thuật toán 2: Item Co-occurrence (Thường mua cùng)

**Áp dụng:** Trang chi tiết sản phẩm.

**Nguyên lý:** "Khách hàng mua sản phẩm A thường cũng mua sản phẩm B" — tương tự gợi ý "Frequently Bought Together" của Amazon.

**Luồng xử lý:**

```
Input: productId (sản phẩm đang xem)

Bước 1: Tìm tất cả Order chứa productId
        Orders = {o | productId ∈ o.items}

Bước 2: Đếm tần suất các sản phẩm khác
        coOccurrence[p] = số đơn hàng chứa
                          cả productId và p

Bước 3: Sắp xếp theo coOccurrence giảm dần
        → Trả về top-K sản phẩm
```

**Ưu điểm:** Không cần dữ liệu user profile, chỉ cần lịch sử đơn hàng → ít bị ảnh hưởng bởi cold start ở cấp sản phẩm.

### 3.3. Thuật toán 3: Cold Start Fallback (Phổ biến)

**Áp dụng:** User mới chưa có lịch sử hành vi; user chưa đăng nhập; khi thuật toán 1 không đủ kết quả.

**Luồng xử lý:**

```
Bước 1: Lấy song song 3 danh sách:
        topSold   = sắp xếp sold giảm dần (trọng số 3)
        topViewed = sắp xếp views giảm dần (trọng số 2)
        newest    = sắp xếp createdAt giảm dần (trọng số 1)

Bước 2: Gộp và tính điểm tổng hợp theo vị trí

Bước 3: Đảm bảo đa dạng danh mục
        (mỗi category tối đa 2 sản phẩm trong kết quả)

Bước 4: Trả về top-N
```

**Mục đích đa dạng hóa:** Tránh hiện tượng filter bubble — toàn bộ gợi ý chỉ thuộc 1 danh mục.

---

## 4. API ENDPOINTS

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/v1/api/recommendations/for-you` | ✅ Cần token | Gợi ý cá nhân hóa |
| GET | `/v1/api/recommendations/popular` | ❌ Public | Sản phẩm phổ biến (Cold Start) |
| GET | `/v1/api/recommendations/bought-together/:productId` | ❌ Public | Thường mua cùng |

### Tham số query

| Tham số | Mặc định | Mô tả |
|---|---|---|
| `limit` | 8 | Số sản phẩm trả về |

### Cấu trúc Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Áo thun PTIT Basic",
      "price": 100000,
      "discount": 10,
      "sold": 57,
      "views": 234,
      "slug": "ao-thun-ptit-basic",
      "category": { "_id": "...", "name": "Áo" },
      "images": [{ "url": "https://..." }]
    }
  ],
  "type": "personalized" | "popular" | "bought-together"
}
```

---

## 5. KẾT QUẢ THỰC TẾ

### 5.1. Trang chủ — Section "Dành Cho [Tên User]"

![Trang chủ PTITShop — Hero Section và Header](C:\Users\nguye\.gemini\antigravity\brain\6c5a294e-4d69-419d-ae21-b8c6309a8f2b\.system_generated\click_feedback\click_feedback_1780238985036.png)

*Hình 1: Trang chủ PTITShop — Header hiển thị "Xin chào, Nguyễn Thanh Qui" sau khi đăng nhập*

---

![Section AI Gợi Ý xuất hiện phía dưới sản phẩm nổi bật](C:\Users\nguye\.gemini\antigravity\brain\6c5a294e-4d69-419d-ae21-b8c6309a8f2b\.system_generated\click_feedback\click_feedback_1780239765675.png)

*Hình 2: Phần chuyển tiếp giữa "Sản phẩm nổi bật" (nền trắng) và section "Dành Cho Qui" (nền tím đậm)*

---

![Section Dành Cho Qui — Carousel gợi ý cá nhân hóa](C:\Users\nguye\.gemini\antigravity\brain\6c5a294e-4d69-419d-ae21-b8c6309a8f2b\.system_generated\click_feedback\click_feedback_1780239781704.png)

*Hình 3: Section "✨ AI GỢI Ý — Dành Cho Qui" đầy đủ — Hiển thị 8 sản phẩm được gợi ý cá nhân hóa dựa trên hành vi người dùng. Các badge giảm giá (-10%, -5%, -20%) được hiển thị tự động.*

**Các thành phần UI quan sát được:**
- **Badge tím "✨ AI GỢI Ý"** — Nhận diện đây là gợi ý AI
- **Tiêu đề cá nhân hóa "Dành Cho Qui"** — Lấy tên từ tài khoản đăng nhập
- **Phụ đề** — "Gợi ý dựa trên lịch sử xem và mua hàng của bạn"
- **Nút điều hướng ‹ ›** — Scroll carousel trái/phải
- **Product Card** mỗi card hiển thị: ảnh sản phẩm, tên danh mục, tên sản phẩm, giá sau giảm, giá gốc gạch ngang, số lượng đã bán
- **Badge giảm giá đỏ** (-10%, -20%...) trên góc trái ảnh

---

### 5.2. Hover Effect — Overlay "Thêm Vào Giỏ"

Khi người dùng hover chuột vào product card trong section gợi ý, một overlay xuất hiện với nút **"🛒 Thêm vào giỏ"**. Click vào nút này sẽ thêm sản phẩm vào giỏ hàng ngay mà không cần vào trang chi tiết.

### 5.3. Skeleton Loading

Trong khi API đang tải dữ liệu, hệ thống hiển thị **skeleton animation** (hiệu ứng nhấp nháy shimmer) thay vì màn hình trắng — giúp người dùng biết nội dung đang được tải.

### 5.4. Xử lý Cold Start (Người dùng chưa đăng nhập)

Khi người dùng chưa đăng nhập:
- Badge thay đổi từ **"✨ AI Gợi Ý"** → **"🔥 Phổ Biến"**
- Màu badge thay đổi từ tím → cam
- Tiêu đề: **"Có Thể Bạn Thích"**
- Dữ liệu: Top sản phẩm bán chạy + xem nhiều + mới nhất

---

## 6. LOGIC XỬ LÝ FALLBACK

Hệ thống có cơ chế **fallback nhiều lớp** để đảm bảo luôn hiển thị nội dung:

```
Layer 1: Personalized (nếu user có đủ lịch sử)
    ↓ (nếu không đủ kết quả)
Layer 2: Bổ sung từ Cold Start popular
    ↓ (nếu API for-you lỗi)
Layer 3: Tự động retry với popular endpoint
    ↓ (nếu tất cả đều lỗi)
Layer 4: Section tự ẩn (return null) — không crash UI
```

---

## 7. CẤU TRÚC CODE CHI TIẾT

### 7.1. recommendationService.js (Backend)

```javascript
// ── Thuật toán 1: Personalized ─────────────────────────
export const getPersonalizedRecommendations = async (userId, limit = 8) => {
  // Bước 1: Lấy hành vi user
  const user = await User.findById(userId).select('viewedProducts favProducts');
  const userOrders = await Order.find({ user: userId }).select('items');

  // Bước 2: Content-Based — tìm category & khoảng giá ưa thích
  const categoryCounts = {};
  interactedProducts.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  // Bước 3: Collaborative Filtering — tìm user tương tự
  const similarUsers = await User.find({
    _id: { $ne: userId },
    $or: [
      { viewedProducts: { $in: interactedObjIds } },
      { favProducts: { $in: interactedObjIds } }
    ]
  }).limit(30);

  // Bước 4: Tính điểm và trả kết quả
  const candidates = await Product.aggregate([
    { $match: { status: 'available', _id: { $nin: excludeIds } } },
    {
      $addFields: {
        score: {
          $add: [
            { $cond: [{ $in: ['$category', preferredCategories] }, 3, 0] },
            { $cond: [priceInRange, 2, 0] },
            { $cond: [{ $in: ['$_id', collaborativeIds] }, 2, 0] },
            { $divide: ['$views', 100] },
            { $divide: ['$sold', 50] }
          ]
        }
      }
    },
    { $sort: { score: -1 } },
    { $limit: limit }
  ]);
};

// ── Thuật toán 2: Item Co-occurrence ──────────────────
export const getFrequentlyBoughtTogether = async (productId, limit = 6) => {
  const orders = await Order.find({ 'items.product': productId });

  const coOccurrence = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.product.toString() !== productId) {
        coOccurrence[item.product] = (coOccurrence[item.product] || 0) + 1;
      }
    });
  });

  // Sắp xếp theo tần suất, trả về top-K
  const topIds = Object.entries(coOccurrence)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => new ObjectId(id));
};

// ── Thuật toán 3: Cold Start ───────────────────────────
export const getColdStartRecommendations = async (limit = 8) => {
  const [topSold, topViewed, newest] = await Promise.all([
    Product.aggregate([{ $sort: { sold: -1 } }, { $limit: limit * 3 }]),
    Product.aggregate([{ $sort: { views: -1 } }, { $limit: limit * 3 }]),
    Product.aggregate([{ $sort: { createdAt: -1 } }, { $limit: limit * 3 }])
  ]);

  // Gộp, tính điểm, đa dạng hóa danh mục
  // Mỗi category tối đa 2 sản phẩm trong kết quả
};
```

### 7.2. RecommendationSection.tsx (Frontend)

```tsx
// Component chính với skeleton loading + carousel
export default function RecommendationSection({
  title, subtitle, products, loading, badge, badgeColor, formatPrice
}) {
  const scrollRef = useRef();

  return (
    <section className="rec-section">
      {/* Header với badge, title, nút ‹ › */}
      <div className="rec-section__header">
        <span className="rec-section__badge" style={{ background: badgeColor }}>
          {badge}
        </span>
        <h2 className="rec-section__title">{title}</h2>
        <NavButtons onScroll={scroll} />
      </div>

      {/* Horizontal scroll carousel */}
      <div className="rec-section__track" ref={scrollRef}>
        {loading
          ? <SkeletonCards count={4} />          // Loading state
          : products.map(p => <RecProductCard product={p} />)  // Data state
        }
      </div>
    </section>
  );
}
```

---

## 8. PHÂN TÍCH CHỨC NĂNG

### 8.1. So sánh trước/sau khi có Recommendation System

| Tiêu chí | Trước | Sau |
|---|---|---|
| Trang chủ | Hiển thị sản phẩm giống nhau cho tất cả user | Cá nhân hóa theo từng user |
| Khám phá sản phẩm | Chỉ qua tìm kiếm/danh mục | Gợi ý chủ động phù hợp sở thích |
| Trang chi tiết | Chỉ "Sản phẩm liên quan" (same category) | + "Thường Mua Cùng" từ dữ liệu đơn hàng thực |
| User mới | Không có gợi ý cụ thể | Cold Start dựa trên sản phẩm phổ biến |
| UI trạng thái tải | Màn hình trắng | Skeleton loading animation |

### 8.2. Điểm mạnh của triển khai

1. **Không cần ML Framework** — Chạy 100% trên MongoDB Aggregation Pipeline → nhẹ, nhanh, không cần dependency ngoài
2. **Đa tầng fallback** — Luôn có nội dung hiển thị, không crash UI
3. **Cá nhân hóa tức thời** — Cập nhật ngay khi user login/logout nhờ `useEffect([token])`
4. **Đa dạng hóa** — Mỗi danh mục tối đa 2 sản phẩm → tránh filter bubble
5. **Responsive UI** — Horizontal scroll carousel hoạt động tốt cả desktop và mobile

### 8.3. Thách thức đã xử lý

| Thách thức | Giải pháp |
|---|---|
| Cold Start (user mới) | Fallback sang popular products đa dạng danh mục |
| Race condition token | Guard check localStorage trước khi gọi API |
| Sản phẩm bị xóa trong đơn hàng | Null guard trong OrdersPage |
| JWT expired 15m | Nâng lên 7d cho môi trường dev |

---

## 9. HƯỚNG PHÁT TRIỂN

| Giai đoạn | Cải tiến |
|---|---|
| **Ngắn hạn** | Cache kết quả gợi ý vào Redis (tránh tính lại mỗi request) |
| **Trung hạn** | Matrix Factorization trên dữ liệu rating (review) |
| **Dài hạn** | Embedding-based Two Tower model, real-time update khi user xem sản phẩm |

---

*Báo cáo được tổng hợp từ quá trình triển khai thực tế trên PITITShop — hệ thống E-commerce được xây dựng với Node.js + Express + MongoDB (Backend) và React + TypeScript (Frontend).*
