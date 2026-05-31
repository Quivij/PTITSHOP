# BÁO CÁO CHỨC NĂNG
# HỆ THỐNG GỢI Ý SẢN PHẨM (RECOMMENDATION SYSTEM)
# Ứng dụng PITITShop

---

**Môn học:** Đảm bảo chất lượng phần mềm  
**Nhóm thực hiện:** Nhóm PITITShop  
**Tên ứng dụng:** PITITShop — Hệ thống thương mại điện tử  
**Công nghệ:** Node.js · Express · MongoDB · React · TypeScript  
**Ngày hoàn thành:** 31/05/2026  

---

## PHẦN 1: GIỚI THIỆU VÀ TỔNG QUAN

### 1.1. Bối cảnh và Lý do chọn chức năng

Trong thời đại thương mại điện tử phát triển mạnh mẽ, người dùng phải đối mặt với lượng sản phẩm khổng lồ trên một nền tảng. Theo nghiên cứu của McKinsey & Company (2021), **35% doanh thu của Amazon** đến từ hệ thống gợi ý sản phẩm. Tương tự, Netflix ước tính hệ thống recommendation giúp **tiết kiệm hơn 1 tỷ USD mỗi năm** nhờ giữ chân người dùng.

Đối với PITITShop — hệ thống thương mại điện tử được xây dựng phục vụ cộng đồng sinh viên và giảng viên trường PTIT — việc cá nhân hóa trải nghiệm mua sắm là yêu cầu thiết thực để:

- **Giảm "thông tin quá tải"**: Người dùng không phải duyệt qua hàng trăm sản phẩm để tìm thứ họ cần.
- **Tăng giá trị đơn hàng**: Gợi ý sản phẩm bổ sung (cross-selling) làm tăng giá trị trung bình mỗi giao dịch.
- **Cải thiện sự hài lòng**: Người dùng cảm thấy được phục vụ cá nhân hóa, không phải "một trong số đông".
- **Tăng tỉ lệ quay lại**: Nội dung thay đổi theo hành vi tạo động lực cho người dùng quay lại thường xuyên hơn.

### 1.2. Mục tiêu của chức năng

Hệ thống gợi ý sản phẩm trong PITITShop được xây dựng với các mục tiêu cụ thể sau:

| Mục tiêu | Chỉ số đo lường |
|---|---|
| Cá nhân hóa trang chủ | Mỗi user thấy danh sách gợi ý khác nhau |
| Tăng khám phá sản phẩm | Gợi ý sản phẩm ngoài danh mục user đang xem |
| Hỗ trợ cross-selling | Section "Thường mua cùng" trên trang chi tiết |
| Xử lý user mới | Cold start fallback với sản phẩm phổ biến |
| Không phụ thuộc AI ngoài | Chạy 100% trên MongoDB, không cần Python/ML |

### 1.3. Phạm vi triển khai

Chức năng được triển khai tại **2 điểm** trong ứng dụng:

```
PITITShop
├── Trang chủ (/home)
│   └── Section "✨ AI GỢI Ý — Dành Cho [Tên User]"
│       ├── Đã đăng nhập → Personalized Recommendation
│       └── Chưa đăng nhập → Popular Products (Cold Start)
│
└── Trang chi tiết sản phẩm (/products/:id)
    └── Section "🛒 Thường Mua Cùng Nhau"
        └── Item Co-occurrence từ lịch sử đơn hàng
```

### 1.4. Công nghệ và công cụ sử dụng

| Lớp | Công nghệ | Phiên bản |
|---|---|---|
| Backend | Node.js + Express | Express 5.x |
| Database | MongoDB | Mongoose 9.x |
| Query Engine | MongoDB Aggregation Pipeline | — |
| Frontend | React + TypeScript | React 19 |
| State Management | Redux Toolkit | 2.x |
| HTTP Client | Axios | 1.x |
| Styling | Vanilla CSS (glassmorphism) | — |

---
