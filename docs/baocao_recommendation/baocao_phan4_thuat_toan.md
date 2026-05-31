## PHẦN 4: MÔ TẢ THUẬT TOÁN

### 4.1. Thuật toán 1 — Personalized Recommendation (Gợi ý cá nhân hóa)

#### 4.1.1. Tổng quan

Thuật toán kết hợp **Content-Based Filtering** và **User-Based Collaborative Filtering** thành một pipeline duy nhất chạy trên MongoDB Aggregation. Đây là thuật toán phức tạp nhất trong hệ thống.

#### 4.1.2. Sơ đồ luồng xử lý

```
                    INPUT: userId
                         │
          ┌──────────────▼──────────────┐
          │  Truy vấn hành vi user      │
          │  - viewedProducts           │
          │  - favProducts              │
          │  - orderItems (lịch sử mua) │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │  Nếu không có lịch sử       │
          │  → Chuyển Cold Start        │◄── FALLBACK
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │  Content-Based Analysis     │
          │  - Đếm tần suất category    │
          │  - Tính khoảng giá TB ±40% │
          │  - Lấy top-3 category       │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │  Collaborative Filtering    │
          │  - Tìm 30 user tương tự     │
          │  - Lấy sản phẩm của họ      │
          │  - Loại sp đã tương tác     │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │  MongoDB Aggregation        │
          │  $addFields: score          │
          │  $sort: score desc          │
          │  $limit: N                  │
          └──────────────┬──────────────┘
                         │
                    OUTPUT: top-N products
```

#### 4.1.3. Công thức tính điểm

```
score(u, i) = w1 × categoryMatch(u, i)
            + w2 × priceMatch(u, i)
            + w3 × collaborativeBonus(i)
            + w4 × log(1 + views_i)
            + w5 × log(1 + sold_i)

Trong đó:
  w1 = 3  (trọng số category ưa thích)
  w2 = 2  (trọng số khoảng giá phù hợp)
  w3 = 2  (trọng số collaborative)
  w4 = views_i / 100
  w5 = sold_i / 50

  categoryMatch(u, i) = 1 nếu category(i) ∈ TopCategories(u)
                       = 0 nếu không

  priceMatch(u, i) = 1 nếu avgPrice(u) × 0.6 ≤ price(i) ≤ avgPrice(u) × 1.4
                   = 0 nếu không

  collaborativeBonus(i) = 1 nếu i ∈ SimilarUsersProducts(u)
                        = 0 nếu không
```

#### 4.1.4. Cài đặt (MongoDB Aggregation Pipeline)

```javascript
// Bước 1: Lấy dữ liệu hành vi
const user = await User.findById(userId)
  .select('viewedProducts favProducts')
  .populate('viewedProducts', 'category price');

const orders = await Order.find({ user: userId })
  .select('items')
  .populate('items.product', 'category price');

// Bước 2: Phân tích Content-Based
const allInteractedProducts = [
  ...user.viewedProducts,
  ...user.favProducts,
  ...orderProducts
];

const categoryCounts = {};
let totalPrice = 0;
allInteractedProducts.forEach(p => {
  if (p?.category) {
    categoryCounts[p.category._id] = (categoryCounts[p.category._id] || 0) + 1;
  }
  if (p?.price) totalPrice += p.price;
});

const avgPrice = totalPrice / allInteractedProducts.length;
const preferredCategories = Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([id]) => new ObjectId(id));

// Bước 3: Collaborative Filtering
const similarUsers = await User.find({
  _id: { $ne: userId },
  $or: [
    { viewedProducts: { $in: interactedObjIds } },
    { favProducts: { $in: interactedObjIds } }
  ]
}).limit(30).select('viewedProducts favProducts');

// Bước 4: Aggregation với scoring
const candidates = await Product.aggregate([
  {
    $match: {
      status: 'available',
      _id: { $nin: excludeIds }
    }
  },
  {
    $addFields: {
      score: {
        $add: [
          { $cond: [{ $in: ['$category', preferredCategories] }, 3, 0] },
          { $cond: [
            { $and: [
              { $gte: ['$price', avgPrice * 0.6] },
              { $lte: ['$price', avgPrice * 1.4] }
            ]}, 2, 0
          ]},
          { $cond: [{ $in: ['$_id', collaborativeIds] }, 2, 0] },
          { $divide: ['$views', 100] },
          { $divide: ['$sold', 50] }
        ]
      }
    }
  },
  { $sort: { score: -1 } },
  { $limit: limit },
  { $lookup: { from: 'categories', localField: 'category',
               foreignField: '_id', as: 'category' } },
  { $unwind: '$category' }
]);
```

---

### 4.2. Thuật toán 2 — Item Co-occurrence (Thường mua cùng)

#### 4.2.1. Tổng quan

Dựa trên **Market Basket Analysis** — phân tích giỏ hàng. Tìm sản phẩm nào hay được mua chung với sản phẩm đang xem.

#### 4.2.2. Công thức

```
support(A ∧ B) = |orders chứa cả A và B| / |tổng số orders|

co_occurrence_count(A, B) = |{order ∈ Orders : A ∈ order ∧ B ∈ order}|

Sắp xếp: B* = argmax_B co_occurrence_count(A, B)
```

#### 4.2.3. Ví dụ minh họa

```
Đơn hàng #1: {Áo PTIT, Mũ PTIT, Tất PTIT}
Đơn hàng #2: {Áo PTIT, Quần PTIT}
Đơn hàng #3: {Mũ PTIT, Tất PTIT, Giày PTIT}
Đơn hàng #4: {Áo PTIT, Mũ PTIT}

User đang xem "Áo PTIT":
→ co_occurrence(Áo, Mũ) = 3 (đơn #1, #2, #4)   ← Cao nhất
→ co_occurrence(Áo, Quần) = 1 (đơn #2)
→ co_occurrence(Áo, Tất) = 1 (đơn #1)

Kết quả gợi ý: [Mũ PTIT, Quần PTIT, Tất PTIT]
```

#### 4.2.4. Cài đặt

```javascript
export const getFrequentlyBoughtTogether = async (productId, limit = 6) => {
  const productObjId = new ObjectId(productId);

  // Tìm tất cả đơn hàng chứa sản phẩm này
  const orders = await Order.find({
    'items.product': productObjId
  }).select('items');

  // Đếm co-occurrence
  const coOccurrence = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const itemId = item.product.toString();
      if (itemId !== productId) {
        coOccurrence[itemId] = (coOccurrence[itemId] || 0) + 1;
      }
    });
  });

  // Sắp xếp và lấy top-K
  const topIds = Object.entries(coOccurrence)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => new ObjectId(id));

  if (topIds.length === 0) return [];

  return await Product.find({
    _id: { $in: topIds },
    status: 'available'
  }).populate('category', 'name').lean();
};
```

---

### 4.3. Thuật toán 3 — Cold Start Fallback (Gợi ý sản phẩm phổ biến)

#### 4.3.1. Tổng quan

Khi không có đủ dữ liệu hành vi (user mới, chưa đăng nhập), hệ thống dùng **Hybrid Popularity Scoring** kết hợp 3 chỉ số: bán chạy, xem nhiều, và mới nhất — đồng thời đảm bảo **đa dạng danh mục**.

#### 4.3.2. Pipeline xử lý song song

```javascript
const [topSold, topViewed, newest] = await Promise.all([
  // Danh sách 1: Bán chạy nhất
  Product.aggregate([
    { $match: { status: 'available' } },
    { $sort: { sold: -1 } },
    { $limit: limit * 3 }
  ]),
  // Danh sách 2: Xem nhiều nhất
  Product.aggregate([
    { $match: { status: 'available' } },
    { $sort: { views: -1 } },
    { $limit: limit * 3 }
  ]),
  // Danh sách 3: Mới nhất
  Product.aggregate([
    { $match: { status: 'available' } },
    { $sort: { createdAt: -1 } },
    { $limit: limit * 3 }
  ])
]);
```

#### 4.3.3. Đa dạng hóa danh mục

```javascript
// Gộp và tính điểm theo vị trí
const scoreMap = {};
const addScore = (products, weight) => {
  products.forEach((p, idx) => {
    const id = p._id.toString();
    const positionScore = (products.length - idx) / products.length;
    scoreMap[id] = (scoreMap[id] || 0) + weight * positionScore;
  });
};

addScore(topSold, 3);    // Bán chạy: trọng số cao nhất
addScore(topViewed, 2);  // Xem nhiều: trọng số trung bình
addScore(newest, 1);     // Mới nhất: trọng số thấp nhất

// Đảm bảo đa dạng — mỗi category tối đa 2 sản phẩm
const categoryCounts = {};
const diverse = [];
for (const product of sorted) {
  const catId = product.category?.toString();
  if (!categoryCounts[catId] || categoryCounts[catId] < 2) {
    diverse.push(product);
    categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
    if (diverse.length >= limit) break;
  }
}
```

### 4.4. Cơ chế Fallback đa tầng

```
Yêu cầu gợi ý từ User A
         │
         ▼
[Tầng 1] Có lịch sử? ──Có──→ Personalized Algorithm
         │                           │
        Không                  Đủ N sản phẩm?
         │                    Có ──→ Trả về kết quả
         │                    Không ─→ Merge với Popular
         │
         ▼
[Tầng 2] Popular Algorithm
         │
         ▼
[Tầng 3] Frontend: nếu for-you lỗi → retry với /popular
         │
         ▼
[Tầng 4] Section tự ẩn nếu data = [] (return null)
```

---
