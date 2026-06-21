# PTITShop Android Mobile App

Ứng dụng mobile Android cho PTITShop, được triển khai bằng **Java + XML Layout** theo tài liệu `ANDROID_JAVA_PROJECT_PLAN.md` và tích hợp API backend theo `API_CLIENT_DOCS.md`.

Project hiện tập trung vào **client/user app**. Phần admin chỉ giữ placeholder để project build được, không phải phạm vi chính.

---

## 1. Tech stack

- Language: Java
- UI: XML Layout + AppCompat + Material Components
- Architecture: MVVM nhẹ + Repository Pattern
- API client: Retrofit + OkHttp + Gson
- Image loading: Glide
- Local session: SharedPreferences
- Build system: Gradle Kotlin DSL
- Minimum SDK: 24
- Target SDK: 36

Các thư viện chính:

- Retrofit `2.11.0`
- OkHttp `4.12.0`
- Glide `4.16.0`
- Material Components `1.13.0`
- AppCompat `1.7.1`
- RecyclerView `1.4.0`
- Lifecycle `2.10.0`

---

## 2. Yêu cầu môi trường

Cần cài:

1. Android Studio hoặc Android SDK.
2. JDK 17.
3. Gradle wrapper đã có sẵn trong project.
4. Backend PTITShop chạy local ở port `6969`.

Project đang cấu hình Gradle dùng JDK 17 tại:

```properties
org.gradle.java.home=C:/Program Files/Microsoft/jdk-17.0.18.8-hotspot
```

Nếu máy khác không có đúng đường dẫn này, sửa lại trong `gradle.properties` cho đúng JDK 17 của máy bạn.

Ví dụ:

```properties
org.gradle.java.home=C:/Program Files/Java/jdk-17
```

Hoặc cấu hình Gradle JDK trong Android Studio.

---

## 3. Cấu hình backend API

Base URL đang đặt trong:

```txt
app/src/main/java/com/ptitshop/app/core/constants/ApiConstants.java
```

Mặc định:

```java
public static final String BASE_URL = "http://10.0.2.2:6969/";
public static final String API_PREFIX = "v1/api/";
```

Giải thích:

- Android Emulator gọi `localhost` của máy host bằng `10.0.2.2`.
- Backend trên máy host cần chạy tại `http://localhost:6969`.
- Nếu chạy trên điện thoại thật cùng mạng LAN, đổi `BASE_URL` sang IP máy chạy backend, ví dụ:

```java
public static final String BASE_URL = "http://192.168.1.10:6969/";
```

Manifest đã bật quyền Internet và cleartext HTTP:

```xml
<uses-permission android:name="android.permission.INTERNET" />
android:usesCleartextTraffic="true"
```

---

## 4. Cách build project

Từ thư mục root project:

```bash
./gradlew :app:assembleDebug
```

Nếu VSCode/Gradle dùng sai JRE và báo lỗi thiếu `jlink`, chạy bằng JDK 17 trực tiếp:

```bash
JAVA_HOME='/c/Program Files/Microsoft/jdk-17.0.18.8-hotspot' \
PATH='/c/Program Files/Microsoft/jdk-17.0.18.8-hotspot/bin':$PATH \
./gradlew :app:assembleDebug --no-daemon
```

Build thành công sẽ tạo APK debug trong:

```txt
app/build/outputs/apk/debug/app-debug.apk
```

---

## 5. Cách chạy app

### Chạy bằng Android Studio

1. Mở project bằng Android Studio.
2. Sync Gradle.
3. Chọn emulator hoặc thiết bị thật.
4. Bấm Run.

### Chạy bằng CLI

Build APK:

```bash
./gradlew :app:assembleDebug
```

Cài vào thiết bị/emulator:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 6. Cấu trúc source chính

Source chính nằm trong:

```txt
app/src/main/java/com/ptitshop/app/
```

### 6.1 Core layer

```txt
core/
├── base/
├── config/
├── constants/
├── network/
├── storage/
└── utils/
```

Chức năng:

- `core/base/`: BaseActivity, BaseFragment, BaseViewModel, BaseResponse.
- `core/constants/`: hằng số app/API.
- `core/network/`: RetrofitClient, AuthInterceptor, TokenAuthenticator, NetworkResult.
- `core/storage/`: SessionManager lưu token/user session bằng SharedPreferences.
- `core/utils/`: tiện ích format tiền, toast, validate, image loading, date.

File quan trọng:

```txt
core/constants/ApiConstants.java
core/network/RetrofitClient.java
core/network/AuthInterceptor.java
core/network/TokenAuthenticator.java
core/storage/SessionManager.java
```

### 6.2 Data layer

```txt
data/
├── model/
└── remote/
    ├── api/
    └── dto/
        ├── request/
        └── response/
```

Chức năng:

- `data/model/`: model dùng trong UI như User, Product, Cart, Order, Review, Voucher.
- `data/remote/api/`: Retrofit interface theo từng feature.
- `data/remote/dto/request/`: DTO request gửi lên backend.
- `data/remote/dto/response/`: DTO response nhận từ backend.

Các API interface chính:

```txt
AuthApi.java
ProductApi.java
CategoryApi.java
CartApi.java
OrderApi.java
PaymentApi.java
ReviewApi.java
UserApi.java
VoucherApi.java
DeliveryAddressApi.java
```

Admin API có file `AdminApi.java` nhưng phần admin không phải phạm vi chính của app hiện tại.

### 6.3 Repository layer

```txt
repository/
```

Repository là lớp trung gian giữa UI và Retrofit API.

Các repository chính:

```txt
AuthRepository.java
ProductRepository.java
CategoryRepository.java
CartRepository.java
OrderRepository.java
PaymentRepository.java
ReviewRepository.java
UserRepository.java
VoucherRepository.java
DeliveryAddressRepository.java
```

Quy ước:

```txt
Activity/Fragment -> Repository -> Retrofit Api -> Backend
```

UI không gọi Retrofit trực tiếp.

### 6.4 UI layer

```txt
ui/
├── auth/
├── main/
├── home/
├── product/
├── cart/
├── checkout/
├── order/
├── profile/
├── address/
├── review/
└── admin/
```

Chức năng:

- `auth/`: đăng nhập, đăng ký, OTP, quên mật khẩu.
- `main/`: MainActivity + bottom navigation.
- `home/`: HomeFragment, adapter category/product horizontal.
- `product/`: product list/detail, product/review adapters.
- `cart/`: giỏ hàng, chọn item, tăng/giảm/xóa.
- `checkout/`: tạo order COD/VNPay.
- `order/`: danh sách đơn, detail, hủy/nhận hàng/review.
- `profile/`: hồ sơ, voucher, review, favorite product, edit profile.
- `address/`: địa chỉ giao hàng CRUD.
- `review/`: tạo review.
- `admin/`: placeholder, không hoàn thiện.

### 6.5 Resource XML

```txt
app/src/main/res/
├── layout/
├── drawable/
├── menu/
└── values/
```

- `layout/`: XML cho Activity, Fragment, item RecyclerView.
- `drawable/`: background, icon vector.
- `menu/`: bottom navigation menu.
- `values/`: colors, dimens, styles, themes, strings.

---

## 7. Các tính năng đã có

### 7.1 Authentication

Đã có:

- Đăng nhập.
- Đăng ký.
- Verify OTP.
- Gửi lại OTP.
- Quên mật khẩu.
- Lưu access token, refresh token và thông tin user cơ bản.
- Tự thêm header:

```http
Authorization: Bearer <accessToken>
```

Files chính:

```txt
ui/auth/LoginActivity.java
ui/auth/RegisterActivity.java
ui/auth/VerifyOtpActivity.java
ui/auth/ForgotPasswordActivity.java
repository/AuthRepository.java
data/remote/api/AuthApi.java
```

### 7.2 Home

Đã có:

- Search bar.
- Danh mục sản phẩm.
- Sản phẩm mới.
- Best sellers.
- Top discount.
- Top viewed.
- Pull refresh.

Files chính:

```txt
ui/home/HomeFragment.java
ui/home/adapter/CategoryAdapter.java
ui/home/adapter/ProductHorizontalAdapter.java
```

### 7.3 Product

Đã có:

- Product list dạng grid 2 cột.
- Search product.
- Product detail.
- Hiển thị ảnh, tên, giá, mô tả, sold/views/rating.
- Similar products.
- Reviews.
- Add to cart.
- Toggle favorite.
- Add viewed product nếu đã login.

Files chính:

```txt
ui/product/ProductListActivity.java
ui/product/ProductDetailActivity.java
ui/product/adapter/ProductGridAdapter.java
ui/product/adapter/ReviewAdapter.java
repository/ProductRepository.java
```

### 7.4 Cart

Đã có:

- Load cart.
- Hiển thị item trong giỏ.
- Checkbox chọn sản phẩm checkout.
- Tăng quantity bằng `quantity = 1`.
- Giảm quantity bằng `quantity = -1`.
- Xóa item khỏi cart.
- Tổng tiền.
- Chuyển sang checkout với danh sách productId đã chọn.

Files chính:

```txt
ui/cart/CartFragment.java
ui/cart/adapter/CartItemAdapter.java
repository/CartRepository.java
```

Lưu ý backend:

```txt
PUT /v1/api/cart/update
```

API này cộng thêm quantity, không set absolptit quantity.

### 7.5 Checkout / Payment

Đã có:

- Nhận selected product IDs từ cart.
- Nhập delivery address ID.
- Nhập voucher code.
- Nhập used xu.
- Chọn COD hoặc VNPay.
- COD thành công -> PaymentResultActivity.
- VNPay -> mở browser bằng payment URL.

Files chính:

```txt
ui/checkout/CheckoutActivity.java
ui/checkout/PaymentResultActivity.java
repository/PaymentRepository.java
data/remote/api/PaymentApi.java
```

Lưu ý:

- VNPay callback hiện backend redirect về web FE theo docs.
- Mobile hiện dùng browser flow cơ bản.

### 7.6 Orders

Đã có:

- List orders.
- Filter theo status:
  - All
  - Pending
  - Preparing
  - Delivering
  - Delivered
  - Cancelled
- Order item actions:
  - Chi tiết.
  - Hủy đơn pending.
  - Xác nhận đã nhận đơn delivering.
  - Đi tới review nếu delivered.
- Order detail screen.

Files chính:

```txt
ui/order/OrderFragment.java
ui/order/OrderDetailActivity.java
ui/order/adapter/OrderAdapter.java
repository/OrderRepository.java
```

Lưu ý backend:

```txt
PUT /v1/api/orders/:orderId/status
```

Frontend gửi trạng thái hiện tại:

```json
{ "statusOrder": "pending" }
```

hoặc:

```json
{ "statusOrder": "delivering" }
```

### 7.7 Profile

Đã có:

- Load profile.
- Hiển thị name/email/username/xu.
- Edit profile.
- Delivery addresses.
- My vouchers.
- My reviews.
- Favorite products.
- Logout.

Files chính:

```txt
ui/profile/ProfileFragment.java
ui/profile/EditProfileActivity.java
ui/profile/MyVouchersActivity.java
ui/profile/MyReviewsActivity.java
ui/profile/FavoriteProductsActivity.java
```

### 7.8 Delivery Address

Đã có:

- List địa chỉ.
- Add address.
- Edit/update address.
- Delete address.
- Set default address.

Files chính:

```txt
ui/address/DeliveryAddressActivity.java
ui/address/AddEditAddressActivity.java
ui/address/AddressAdapter.java
repository/DeliveryAddressRepository.java
```

### 7.9 Review

Đã có:

- Lấy review sản phẩm.
- My reviews.
- Tạo review với orderId, productId, rating, comment.

Files chính:

```txt
ui/review/CreateReviewActivity.java
ui/profile/MyReviewsActivity.java
repository/ReviewRepository.java
data/remote/api/ReviewApi.java
```

### 7.10 Voucher

Đã có:

- My vouchers.
- Hiển thị xu.
- Hiển thị voucher code/type/value/expiry.

Files chính:

```txt
ui/profile/MyVouchersActivity.java
ui/profile/VoucherAdapter.java
repository/VoucherRepository.java
```

### 7.11 Favorite products

Đã có:

- Lấy `favProducts` từ profile.
- Fetch product detail từng ID.
- Hiển thị grid favorite products.
- Click vào product detail.

Files chính:

```txt
ui/profile/FavoriteProductsActivity.java
```

---

## 8. Admin

Phần admin **không hoàn thiện** theo phạm vi hiện tại.

Có một số file placeholder để project build không lỗi:

```txt
ui/admin/
data/remote/api/AdminApi.java
repository/AdminRepository.java
```

Nếu cần làm admin sau, có thể bổ sung các màn:

- Dashboard revenue/users.
- Orders management.
- Product create/update/delete.
- User active toggle.

---

## 9. Luồng hoạt động chính

### Login

```txt
LoginActivity
-> AuthRepository.login()
-> AuthApi.login()
-> SessionManager.saveLoginSession()
-> MainActivity
```

### Home/Product

```txt
HomeFragment
-> ProductRepository / CategoryRepository
-> ProductApi / CategoryApi
-> RecyclerView adapters
```

### Add to cart

```txt
ProductDetailActivity
-> CartRepository.add(productId, 1)
-> CartApi.addToCart()
```

### Cart update

```txt
CartFragment
-> CartItemAdapter action
-> CartRepository.updateDelta(productId, +1/-1)
-> CartApi.updateCartItem()
```

### Checkout

```txt
CartFragment selected product IDs
-> CheckoutActivity
-> PaymentRepository.create()
-> PaymentApi.createPayment()
-> COD result hoặc VNPay browser
```

### Order status

```txt
OrderFragment / OrderDetailActivity
-> OrderRepository.updateStatus(orderId, currentStatus)
-> OrderApi.updateOrderStatus()
```

### Review

```txt
Order delivered
-> CreateReviewActivity
-> ReviewRepository.create()
-> ReviewApi.createReview()
```

---

## 10. Build status hiện tại

Lần kiểm tra gần nhất:

```txt
BUILD SUCCESSFUL
```

Command đã dùng:

```bash
JAVA_HOME='/c/Program Files/Microsoft/jdk-17.0.18.8-hotspot' \
PATH='/c/Program Files/Microsoft/jdk-17.0.18.8-hotspot/bin':$PATH \
./gradlew :app:assembleDebug --no-daemon
```

---

## 11. Những điểm cần test runtime với backend thật

Dù build đã pass, vẫn nên test runtime các luồng sau với backend đang chạy:

1. Register -> Verify OTP -> Login.
2. Home load category/product.
3. Product detail parse đúng image/review/category.
4. Add to cart.
5. Cart tăng/giảm/xóa item.
6. Checkout COD.
7. Checkout VNPay browser URL.
8. Orders filter/status update.
9. Create review.
10. Profile update.
11. Address add/edit/delete/default.
12. My vouchers.
13. Favorite products.

Nếu JSON thực tế backend lệch docs, cần chỉnh DTO tương ứng trong:

```txt
data/model/
data/remote/dto/response/
```

---

## 12. Ghi chú giới hạn hiện tại

- UI đã đủ tính năng chính nhưng vẫn ở mức demo/basic, chưa polish như production.
- Product detail chưa có image carousel xịn.
- Product list chưa có infinite pagination đầy đủ.
- Checkout chọn address/voucher còn đơn giản, chưa có bottom sheet/dialog chọn đẹp.
- Order detail chưa render cực sâu toàn bộ order summary như app thương mại thật.
- Một số text trong UI đang không dấu để tránh lỗi encoding khi build trên môi trường hiện tại.

---

## 13. Tài liệu liên quan

- `ANDROID_JAVA_PROJECT_PLAN.md`: kế hoạch kiến trúc Android Java/XML.
- `API_CLIENT_DOCS.md`: tài liệu API backend client.
