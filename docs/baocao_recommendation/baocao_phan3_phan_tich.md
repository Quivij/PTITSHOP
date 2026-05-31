## PHẦN 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 3.1. Phân tích yêu cầu

#### 3.1.1. Yêu cầu chức năng (Functional Requirements)

| ID | Yêu cầu | Mức độ ưu tiên |
|---|---|---|
| FR-01 | Hiển thị gợi ý sản phẩm cá nhân hóa trên trang chủ | Cao |
| FR-02 | Gợi ý thay đổi khi user đăng nhập/đăng xuất | Cao |
| FR-03 | Hiển thị tên user trong tiêu đề section | Trung |
| FR-04 | Hiển thị sản phẩm thường mua cùng trên trang chi tiết | Cao |
| FR-05 | Fallback sang popular products khi không có lịch sử | Cao |
| FR-06 | Loại bỏ sản phẩm đã tương tác khỏi danh sách gợi ý | Cao |
| FR-07 | Đảm bảo đa dạng danh mục trong kết quả gợi ý | Trung |
| FR-08 | Hỗ trợ cuộn ngang (horizontal scroll) danh sách gợi ý | Trung |
| FR-09 | Hiển thị skeleton loading trong khi đang tải | Thấp |
| FR-10 | Thêm vào giỏ hàng ngay từ card gợi ý (hover overlay) | Thấp |

#### 3.1.2. Yêu cầu phi chức năng (Non-Functional Requirements)

| ID | Yêu cầu | Chỉ tiêu |
|---|---|---|
| NFR-01 | Thời gian phản hồi API | < 500ms |
| NFR-02 | Không phụ thuộc thư viện ML ngoài | 0 dependency ngoài |
| NFR-03 | Không crash UI khi API lỗi | Fallback graceful |
| NFR-04 | Responsive trên mobile | Tối thiểu 375px |
| NFR-05 | Bảo mật: endpoint cá nhân hóa cần xác thực | JWT token |

### 3.2. Phân tích dữ liệu hiện có

Hệ thống PITITShop đã có sẵn các nguồn dữ liệu sau được khai thác cho recommendation:

#### 3.2.1. Dữ liệu hành vi người dùng (User Behavior Data)

```javascript
// Model: User
{
  _id: ObjectId,
  fullName: String,
  viewedProducts: [ObjectId],   // ← Lịch sử xem sản phẩm
  favProducts: [ObjectId],      // ← Sản phẩm yêu thích
  // ...
}
```

```javascript
// Model: Order
{
  user: ObjectId,
  items: [{
    product: ObjectId,          // ← Lịch sử mua hàng
    quantity: Number
  }],
  // ...
}
```

#### 3.2.2. Dữ liệu sản phẩm (Item Data)

```javascript
// Model: Product
{
  _id: ObjectId,
  name: String,
  price: Number,               // ← Khoảng giá
  discount: Number,
  category: ObjectId,          // ← Danh mục
  sold: Number,                // ← Độ phổ biến (sold)
  views: Number,               // ← Độ phổ biến (views)
  status: String,
  createdAt: Date              // ← Tính mới
}
```

#### 3.2.3. Ma trận tương tác (Interaction Matrix)

```
              SP1  SP2  SP3  SP4  SP5  ...
UserA         V    V    F    -    B    ...   (V=Viewed, F=Fav, B=Bought)
UserB         -    V    -    V    B    ...
UserC         V    -    V    -    -    ...
...
```

Điểm tương tác được gán trọng số:
- **Mua hàng (B)** = điểm cao nhất (thể hiện ý định mạnh nhất)
- **Yêu thích (F)** = điểm trung bình
- **Xem (V)** = điểm thấp nhất

### 3.3. Thiết kế kiến trúc

#### 3.3.1. Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Redux)                      │
│                                                              │
│  ┌──────────────┐    ┌────────────────────────────────────┐  │
│  │  HomePage    │    │     ProductDetailPage              │  │
│  │              │    │                                    │  │
│  │  useEffect   │    │     useEffect                      │  │
│  │  [token]     │    │     [product._id]                  │  │
│  └──────┬───────┘    └──────────────┬─────────────────────┘  │
│         │                           │                         │
│         ▼                           ▼                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              recommendationApi.ts (Axios)             │    │
│  │  getForYou()  getPopular()  getBoughtTogether(id)     │    │
│  └──────────────────────────┬───────────────────────────┘    │
└─────────────────────────────┼────────────────────────────────┘
                              │ HTTPS (Bearer Token)
┌─────────────────────────────┼────────────────────────────────┐
│                SERVER (Node.js + Express)                      │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │              routes/api.js                            │   │
│  │  GET /recommendations/for-you      [auth required]    │   │
│  │  GET /recommendations/popular      [public]           │   │
│  │  GET /recommendations/bought-together/:id  [public]   │   │
│  └────────────────────────┬──────────────────────────────┘   │
│                           │                                   │
│  ┌────────────────────────▼──────────────────────────────┐   │
│  │         recommendationController.js                   │   │
│  │  getForYou()   getPopular()   getBoughtTogether()     │   │
│  └────────────────────────┬──────────────────────────────┘   │
│                           │                                   │
│  ┌────────────────────────▼──────────────────────────────┐   │
│  │         recommendationService.js                      │   │
│  │  getPersonalized()  getFreqBought()  getColdStart()   │   │
│  └────────────────────────┬──────────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────┘
                              │ MongoDB Aggregation Pipeline
┌─────────────────────────────┼────────────────────────────────┐
│                   DATABASE (MongoDB)                           │
│                                                              │
│       Collection: users   orders   products                  │
└──────────────────────────────────────────────────────────────┘
```

#### 3.3.2. Luồng dữ liệu — Personalized Recommendation

```
User đăng nhập
     │
     ▼
Redux state.token thay đổi
     │
     ▼
useEffect([token]) trigger
     │
     ├─── [token tồn tại] ──→ recommendationApi.getForYou()
     │                              │
     │                              ▼
     │                    GET /v1/api/recommendations/for-you
     │                    Header: Authorization: Bearer <token>
     │                              │
     │                              ▼
     │                    Controller xác thực JWT
     │                    Lấy userId từ req.user.userId
     │                              │
     │                              ▼
     │                    recommendationService.getPersonalized(userId)
     │                              │
     │                   ┌──────────┴────────────┐
     │                   ▼                       ▼
     │           Content-Based            Collaborative
     │           (category + price)       (similar users)
     │                   └──────────┬────────────┘
     │                              ▼
     │                    Tính điểm, sắp xếp, loại trùng
     │                              │
     │                              ▼
     │                    Response: { success, data[], type }
     │                              │
     └─── [không có token] ──→ recommendationApi.getPopular()
                                    │
                                    ▼
                         Cold Start (Popular Products)
```

### 3.4. Thiết kế cơ sở dữ liệu (Không thay đổi schema)

Hệ thống recommendation **không yêu cầu thêm collection mới** — tận dụng hoàn toàn dữ liệu hiện có:

| Collection | Field sử dụng | Mục đích |
|---|---|---|
| `users` | `viewedProducts`, `favProducts` | Lịch sử hành vi |
| `orders` | `items.product`, `user` | Co-occurrence mining |
| `products` | `category`, `price`, `sold`, `views`, `status` | Content & Popularity |

### 3.5. Thiết kế API

#### Endpoint 1: Gợi ý cá nhân hóa

```
GET /v1/api/recommendations/for-you?limit=8
Authorization: Bearer <access_token>

Response 200:
{
  "success": true,
  "type": "personalized",
  "data": [
    {
      "_id": "...",
      "name": "Áo thun PTIT Basic",
      "price": 100000,
      "discount": 10,
      "sold": 57,
      "views": 234,
      "slug": "ao-thun-ptit-basic-...",
      "category": { "_id": "...", "name": "Áo" },
      "images": [{ "url": "https://..." }]
    },
    // ... 7 sản phẩm nữa
  ]
}
```

#### Endpoint 2: Sản phẩm phổ biến (Cold Start)

```
GET /v1/api/recommendations/popular?limit=8

Response 200:
{
  "success": true,
  "type": "popular",
  "data": [ /* top 8 sản phẩm phổ biến */ ]
}
```

#### Endpoint 3: Thường mua cùng

```
GET /v1/api/recommendations/bought-together/:productId?limit=6

Response 200:
{
  "success": true,
  "type": "bought-together",
  "data": [ /* top 6 sản phẩm hay mua kèm */ ]
}
```

---
