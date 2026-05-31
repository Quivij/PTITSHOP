## PHẦN 2: CƠ SỞ LÝ THUYẾT

### 2.1. Tổng quan về Hệ thống Gợi ý

**Hệ thống gợi ý (Recommendation System)** là một nhánh của trí tuệ nhân tạo và học máy, chuyên dự đoán "xếp hạng" hoặc "sở thích" mà người dùng sẽ dành cho một mục (item) chưa được tương tác. Mục tiêu là xếp hạng và trình bày những item có khả năng được người dùng quan tâm nhất.

Bài toán có thể được hình thức hóa như sau:

> **Cho:** Tập người dùng U, tập sản phẩm I, ma trận tương tác R (U × I)  
> **Tìm:** Hàm f: U × I → ℝ sao cho f(u, i) dự đoán mức độ quan tâm của user u với item i  
> **Output:** Top-N items có f(u, i) cao nhất cho mỗi user u

### 2.2. Các phương pháp chính

#### 2.2.1. Content-Based Filtering (Lọc theo nội dung)

**Nguyên lý:** Gợi ý sản phẩm tương tự với những gì người dùng đã thích, dựa trên **thuộc tính** của sản phẩm.

```
Người dùng thích iPhone (category: Điện thoại, giá: cao)
→ Gợi ý: Samsung Galaxy, Oppo Reno (cùng category, cùng khoảng giá)
```

**Ưu điểm:**
- Không cần dữ liệu từ user khác
- Giải thích được lý do gợi ý

**Nhược điểm:**
- Filter Bubble: Chỉ gợi ý trong "bong bóng" sở thích hiện tại
- Không khám phá được sản phẩm hoàn toàn mới

#### 2.2.2. Collaborative Filtering (Lọc cộng tác)

**Nguyên lý:** Gợi ý dựa trên hành vi của **nhóm người dùng tương tự**.

**User-Based Collaborative Filtering:**
```
Nếu User A và User B đã xem {Áo PTIT, Mũ PTIT}
và User B thêm thích Quần PTIT
→ Gợi ý Quần PTIT cho User A
```

**Công thức tính độ tương đồng (Cosine Similarity):**

```
        Σ(r_ui × r_vi)
sim(u,v) = ──────────────────────────────
           √(Σr_ui²) × √(Σr_vi²)
```

Trong đó:
- `r_ui`: mức độ tương tác của user u với item i
- `r_vi`: mức độ tương tác của user v với item i

**Ưu điểm:**
- Khám phá được sản phẩm ngoài sở thích hiện tại
- Không cần biết thuộc tính sản phẩm

**Nhược điểm:**
- Cold Start: Khó xử lý user mới hoặc sản phẩm mới
- Scalability: Khó scale khi số user/item lớn

#### 2.2.3. Matrix Factorization (Phân rã ma trận)

**Nguyên lý:** Phân rã ma trận tương tác R thành tích của 2 ma trận thấp chiều:

```
R ≈ P × Q^T

Trong đó:
- P ∈ ℝ^(|U| × k): User embedding matrix
- Q ∈ ℝ^(|I| × k): Item embedding matrix
- k: số chiều ẩn (latent factors)

Dự đoán: r̂_ui = p_u · q_i = Σ p_uk × q_ik
```

**Ứng dụng thực tế:** Netflix Prize (2009) — Thuật toán SVD++ giành giải thưởng 1 triệu USD.

#### 2.2.4. Item Co-occurrence (Đồng xuất hiện theo mục)

**Nguyên lý:** Phân tích **mẫu mua hàng** — sản phẩm nào thường xuất hiện cùng trong một đơn hàng.

```
co_occur(A, B) = |{orders : A ∈ order AND B ∈ order}|
                 ───────────────────────────────────────
                          |{orders : A ∈ order}|
```

**Ưu điểm:**
- Không cần thông tin user (không bị cold start ở user level)
- Phản ánh hành vi mua hàng thực tế
- Đơn giản, nhanh, dễ giải thích

#### 2.2.5. Popularity-Based (Dựa trên độ phổ biến)

**Nguyên lý:** Gợi ý sản phẩm được nhiều người tương tác nhất — không cá nhân hóa nhưng là giải pháp hiệu quả cho **Cold Start**.

**Chỉ số phổ biến:**
- `sold` — số lượng đã bán
- `views` — số lượt xem
- `createdAt` — tính mới của sản phẩm

### 2.3. Vấn đề Cold Start

**Cold Start** là thách thức lớn nhất của Recommendation System:

| Loại Cold Start | Mô tả | Giải pháp |
|---|---|---|
| User Cold Start | User mới, chưa có lịch sử | Dùng Popularity-Based |
| Item Cold Start | Sản phẩm mới, chưa ai tương tác | Dùng Content-Based (category, giá) |
| System Cold Start | Hệ thống mới, không có dữ liệu | Dùng Editorial picks / trending |

### 2.4. Vấn đề Filter Bubble và Diversity

Nếu chỉ tối ưu theo sở thích hiện tại, hệ thống sẽ rơi vào **Filter Bubble** — người dùng chỉ thấy những gì họ đã biết, giảm khả năng khám phá.

**Giải pháp đa dạng hóa (Diversity):**
- Giới hạn số sản phẩm cùng danh mục trong kết quả
- Kết hợp nhiều thuật toán (Hybrid)
- Thêm yếu tố ngẫu nhiên có kiểm soát

### 2.5. Đánh giá chất lượng Recommendation

| Chỉ số | Công thức | Ý nghĩa |
|---|---|---|
| Precision@K | TP / K | Tỉ lệ gợi ý đúng trong top K |
| Recall@K | TP / Total Relevant | Tỉ lệ tìm được item liên quan |
| NDCG@K | DCG/IDCG | Chất lượng có tính đến thứ hạng |
| Coverage | \|Rec Items\| / \|All Items\| | Độ phủ danh mục sản phẩm |

---
