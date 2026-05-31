## PHẦN 7: ĐÁNH GIÁ, KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 7.1. Đánh giá ưu điểm

#### 7.1.1. Về mặt kỹ thuật

**1. Không cần ML Framework ngoài**

Toàn bộ logic recommendation chạy trực tiếp trên **MongoDB Aggregation Pipeline** mà không cần cài đặt thêm bất kỳ thư viện Python, TensorFlow, hay scikit-learn nào. Điều này mang lại:
- **Zero dependency overhead** — không tăng bundle size
- **Dễ bảo trì** — developer Node.js bình thường có thể đọc và sửa
- **Deployment đơn giản** — không cần Python runtime riêng

**2. Hybrid Approach hiệu quả**

Việc kết hợp Content-Based + Collaborative + Popularity trong một pipeline duy nhất giúp:
- Bù đắp nhược điểm của từng phương pháp riêng lẻ
- Cold Start được giải quyết ở nhiều tầng
- Đa dạng kết quả hơn so với chỉ dùng một thuật toán

**3. Graceful Degradation**

Hệ thống được thiết kế với 4 tầng fallback — đảm bảo **không bao giờ hiển thị màn hình trống** hay crash giao diện, ngay cả khi API backend hoàn toàn không phản hồi.

**4. UX tốt**

- **Skeleton loading**: Người dùng biết nội dung đang tải, không cảm thấy trang "chết"
- **Cá nhân hóa tiêu đề**: "Dành Cho Qui" thay vì "Dành Cho Bạn" — tạo cảm giác thân thiện
- **Hover overlay**: Thêm vào giỏ ngay từ carousel mà không cần vào trang chi tiết
- **Horizontal scroll**: Phù hợp với thói quen dùng mobile

#### 7.1.2. Về mặt kinh doanh

| Lợi ích | Cơ chế |
|---|---|
| Tăng thời gian trên trang | Nội dung cá nhân hóa liên tục kích thích khám phá |
| Tăng giá trị đơn hàng | "Thường mua cùng" gợi ý cross-sell hiệu quả |
| Cải thiện retention | User có lý do quay lại — gợi ý cập nhật theo hành vi mới |
| Giảm bounce rate | Trang chủ có nội dung relevant thay vì generic |

### 7.2. Đánh giá nhược điểm và giới hạn

#### 7.2.1. Giới hạn về dữ liệu

- **Sparse Matrix**: Khi số sản phẩm và user còn ít, ma trận tương tác rất thưa thớt — collaborative filtering kém chính xác.
- **Không có Implicit Feedback chi tiết**: Thời gian xem sản phẩm (dwell time), scroll depth không được ghi lại — chỉ có binary viewed/not viewed.
- **Không có real-time update**: Gợi ý chỉ cập nhật khi user đăng nhập lại hoặc reload trang.

#### 7.2.2. Giới hạn về thuật toán

- **Không có A/B Testing**: Chưa đo được thực tế thuật toán có tốt hơn hiển thị ngẫu nhiên không.
- **Trọng số cố định**: Các hệ số w1, w2, w3... được gán thủ công, chưa được tối ưu bằng dữ liệu.
- **Không xử lý temporal**: Chưa tính đến yếu tố thời gian — hành vi cách đây 6 tháng và hôm qua được xem như nhau.

#### 7.2.3. Giới hạn về hiệu năng

- **Không có caching**: Mỗi request đều tính toán lại từ đầu — khi user base lớn, có thể tạo tải cho MongoDB.
- **N+1 Query tiềm ẩn**: Một số pipeline có thể được tối ưu thêm.

### 7.3. Hướng phát triển

#### 7.3.1. Ngắn hạn (1-3 tháng)

| Cải tiến | Mô tả |
|---|---|
| **Redis Cache** | Cache kết quả gợi ý 30 phút — giảm load DB |
| **Session Tracking** | Ghi lại thời gian xem trang (`dwell time`) để tăng độ chính xác |
| **Feedback Loop** | Khi user click vào gợi ý → ghi nhận implicit feedback |
| **Decay Factor** | Hành vi gần đây có trọng số cao hơn hành vi xa |

```javascript
// Ví dụ decay factor
const decayScore = (interactedAt, now) => {
  const daysDiff = (now - interactedAt) / (1000 * 60 * 60 * 24);
  return Math.exp(-0.1 * daysDiff);  // Exponential decay
};
```

#### 7.3.2. Trung hạn (3-6 tháng)

| Cải tiến | Mô tả |
|---|---|
| **Matrix Factorization** | SVD/ALS trên ma trận user-item — chính xác hơn user-based CF |
| **Learning to Rank** | Dùng LightGBM hoặc XGBoost để tối ưu thứ hạng gợi ý |
| **A/B Testing Framework** | So sánh thuật toán mới với baseline |
| **Diversity Metrics** | Đo NDCG, Coverage, Diversity tự động |

#### 7.3.3. Dài hạn (6+ tháng)

| Cải tiến | Mô tả |
|---|---|
| **Two-Tower Model** | Neural network embedding cho user và item — dùng Python microservice |
| **Real-time Recommendation** | Cập nhật gợi ý ngay khi user xem sản phẩm (WebSocket) |
| **Sequential Recommendation** | Tính đến thứ tự hành vi (RNN/Transformer-based) |
| **Multi-armed Bandit** | Cân bằng exploration vs exploitation |

### 7.4. Kết luận

Chức năng **Hệ thống Gợi ý Sản phẩm** đã được triển khai thành công trong PITITShop với các điểm nổi bật:

✅ **Đã hoàn thành:**
- 3 thuật toán gợi ý (Personalized, Co-occurrence, Cold Start)
- 3 API endpoints với xác thực phù hợp
- Giao diện carousel đẹp, responsive, có skeleton loading
- Tích hợp tại trang chủ và trang chi tiết sản phẩm
- Cơ chế fallback đa tầng — không bao giờ crash UI
- Cá nhân hóa tên user trong tiêu đề section

⚙️ **Cần cải thiện:**
- Thêm caching (Redis) khi scale
- Thu thập thêm implicit feedback (dwell time, scroll)
- A/B testing để đo hiệu quả thực tế

🎯 **Bài học rút ra:**
- Recommendation System không nhất thiết cần AI/ML framework phức tạp để mang lại giá trị thực tế — MongoDB Aggregation Pipeline đủ mạnh cho giai đoạn đầu.
- Cold Start là vấn đề quan trọng cần giải quyết từ ngày đầu, không phải để sau.
- UX của section gợi ý quan trọng không kém thuật toán — skeleton loading, hover effect, và cá nhân hóa tiêu đề tạo ra cảm giác premium đáng kể.

---

## TÀI LIỆU THAM KHẢO

1. Ricci, F., Rokach, L., & Shapira, B. (2015). *Recommender Systems Handbook* (2nd ed.). Springer.
2. Koren, Y., Bell, R., & Volinsky, C. (2009). Matrix factorization techniques for recommender systems. *IEEE Computer*, 42(8), 30–37.
3. Aggarwal, C. C. (2016). *Recommender Systems: The Textbook*. Springer.
4. Covington, P., Adams, J., & Sargin, E. (2016). Deep neural networks for YouTube recommendations. *RecSys '16*.
5. MongoDB Documentation. (2024). *Aggregation Pipeline*. https://www.mongodb.com/docs/manual/core/aggregation-pipeline/
6. McKinsey & Company. (2021). *The value of getting personalization right—or wrong—is multiplying*.
7. Harper, F. M., & Konstan, J. A. (2015). The MovieLens datasets: History and context. *ACM TiiS*, 5(4), 19.
8. Zhang, S., Yao, L., Sun, A., & Tay, Y. (2019). Deep learning based recommender system: A survey and new perspectives. *ACM Computing Surveys*, 52(1), 1–38.

---

*Báo cáo được thực hiện bởi nhóm PITITShop — Môn Đảm bảo chất lượng phần mềm, Học viện Công nghệ Bưu chính Viễn thông TP.HCM (PTIT HCM), 2026.*
