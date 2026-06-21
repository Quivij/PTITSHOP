# Android Java Mobile Project Plan - UTEShop

Tài liệu này là plan setup project mobile Android Java cho UTEShop. Mục tiêu chính: UI/UX cơ bản, dễ implement, cấu trúc file rõ theo module/feature/layer, tích hợp được API backend từ `API_CLIENT_DOCS.md`.

---

## 1. Tech stack đề xuất

### Core

- Language: Java
- UI: XML Layout + AppCompat/Material Components
- Architecture: MVVM nhẹ + Repository pattern
- API client: Retrofit + OkHttp + Gson
- Image loading: Glide
- Local storage:
  - SharedPreferences cho `accessToken`, `refreshToken`, thông tin user cơ bản
  - Room để sau nếu cần cache product/cart/order
- Async:
  - Retrofit `Call<T>` callback cho giai đoạn đầu
  - Có thể bổ sung LiveData/ViewModel để quản lý state UI

### Libraries

```gradle
// Retrofit
implementation 'com.squareup.retrofit2:retrofit:2.11.0'
implementation 'com.squareup.retrofit2:converter-gson:2.11.0'

// OkHttp
implementation 'com.squareup.okhttp3:okhttp:4.12.0'
implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'

// Image loading
implementation 'com.github.bumptech.glide:glide:4.16.0'
annotationProcessor 'com.github.bumptech.glide:compiler:4.16.0'

// Material UI
implementation 'com.google.android.material:material:1.12.0'

// RecyclerView/CardView/SwipeRefresh
implementation 'androidx.recyclerview:recyclerview:1.3.2'
implementation 'androidx.cardview:cardview:1.0.0'
implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'

// Lifecycle optional
implementation 'androidx.lifecycle:lifecycle-viewmodel:2.8.4'
implementation 'androidx.lifecycle:lifecycle-livedata:2.8.4'
```

---

## 2. Architecture tổng thể

Nên dùng kiến trúc:

```txt
UI Layer
  Activity / Fragment / Adapter

ViewModel Layer
  Quản lý state màn hình, gọi repository

Repository Layer
  Gọi API, xử lý response, lưu token, map data

Data Layer
  Retrofit API service, DTO request/response, model, local storage

Core Layer
  Constants, Base classes, network config, utils, session manager
```

Luồng cơ bản:

```txt
Activity/Fragment
    ↓
ViewModel
    ↓
Repository
    ↓
Retrofit ApiService
    ↓
Backend API
```

Nếu muốn code nhanh, có thể bỏ ViewModel ở vài màn hình đầu, nhưng vẫn nên tạo folder ViewModel từ đầu để project không bị loạn khi mở rộng.

---

## 3. Package structure đề xuất

Package ví dụ:

```txt
com.uteshop.app
```

Cấu trúc Java:

```txt
app/src/main/java/com/uteshop/app/

├── core/
│   ├── config/
│   │   └── AppConfig.java
│   ├── constants/
│   │   ├── ApiConstants.java
│   │   └── AppConstants.java
│   ├── base/
│   │   ├── BaseActivity.java
│   │   ├── BaseFragment.java
│   │   ├── BaseViewModel.java
│   │   └── BaseResponse.java
│   ├── network/
│   │   ├── RetrofitClient.java
│   │   ├── AuthInterceptor.java
│   │   ├── TokenAuthenticator.java
│   │   └── NetworkResult.java
│   ├── storage/
│   │   └── SessionManager.java
│   └── utils/
│       ├── DateUtils.java
│       ├── CurrencyUtils.java
│       ├── ImageUtils.java
│       ├── ToastUtils.java
│       └── ValidationUtils.java
│
├── data/
│   ├── remote/
│   │   ├── api/
│   │   │   ├── AuthApi.java
│   │   │   ├── ProductApi.java
│   │   │   ├── CategoryApi.java
│   │   │   ├── CartApi.java
│   │   │   ├── OrderApi.java
│   │   │   ├── PaymentApi.java
│   │   │   ├── ReviewApi.java
│   │   │   ├── UserApi.java
│   │   │   ├── VoucherApi.java
│   │   │   ├── DeliveryAddressApi.java
│   │   │   └── AdminApi.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   └── mapper/
│   │       └── ApiMapper.java
│   │
│   ├── local/
│   │   ├── preferences/
│   │   │   └── PreferenceKeys.java
│   │   └── db/
│   │       └── optional-room-later.txt
│   │
│   └── model/
│       ├── User.java
│       ├── Product.java
│       ├── ProductImage.java
│       ├── Category.java
│       ├── Cart.java
│       ├── CartItem.java
│       ├── Order.java
│       ├── OrderItem.java
│       ├── Review.java
│       ├── Voucher.java
│       └── DeliveryAddress.java
│
├── repository/
│   ├── AuthRepository.java
│   ├── ProductRepository.java
│   ├── CategoryRepository.java
│   ├── CartRepository.java
│   ├── OrderRepository.java
│   ├── PaymentRepository.java
│   ├── ReviewRepository.java
│   ├── UserRepository.java
│   ├── VoucherRepository.java
│   └── DeliveryAddressRepository.java
│
├── ui/
│   ├── auth/
│   │   ├── LoginActivity.java
│   │   ├── RegisterActivity.java
│   │   ├── VerifyOtpActivity.java
│   │   ├── ForgotPasswordActivity.java
│   │   └── AuthViewModel.java
│   │
│   ├── main/
│   │   ├── MainActivity.java
│   │   └── MainViewModel.java
│   │
│   ├── home/
│   │   ├── HomeFragment.java
│   │   ├── HomeViewModel.java
│   │   └── adapter/
│   │       ├── ProductHorizontalAdapter.java
│   │       └── CategoryAdapter.java
│   │
│   ├── product/
│   │   ├── ProductListActivity.java
│   │   ├── ProductDetailActivity.java
│   │   ├── ProductViewModel.java
│   │   └── adapter/
│   │       ├── ProductGridAdapter.java
│   │       ├── ProductImageAdapter.java
│   │       └── ReviewAdapter.java
│   │
│   ├── cart/
│   │   ├── CartFragment.java
│   │   ├── CartViewModel.java
│   │   └── adapter/
│   │       └── CartItemAdapter.java
│   │
│   ├── checkout/
│   │   ├── CheckoutActivity.java
│   │   ├── PaymentResultActivity.java
│   │   └── CheckoutViewModel.java
│   │
│   ├── order/
│   │   ├── OrderFragment.java
│   │   ├── OrderDetailActivity.java
│   │   ├── OrderViewModel.java
│   │   └── adapter/
│   │       └── OrderAdapter.java
│   │
│   ├── profile/
│   │   ├── ProfileFragment.java
│   │   ├── EditProfileActivity.java
│   │   ├── FavoriteProductsActivity.java
│   │   └── ProfileViewModel.java
│   │
│   ├── address/
│   │   ├── DeliveryAddressActivity.java
│   │   ├── AddEditAddressActivity.java
│   │   └── AddressViewModel.java
│   │
│   ├── review/
│   │   ├── CreateReviewActivity.java
│   │   └── ReviewViewModel.java
│   │
│   └── admin/
│       ├── AdminDashboardActivity.java
│       ├── AdminOrderActivity.java
│       ├── AdminProductActivity.java
│       ├── AdminUserActivity.java
│       └── AdminViewModel.java
│
└── UTEShopApplication.java
```

---

## 4. Resource/layout structure

```txt
app/src/main/res/

├── layout/
│   ├── activity_login.xml
│   ├── activity_register.xml
│   ├── activity_verify_otp.xml
│   ├── activity_forgot_password.xml
│   ├── activity_main.xml
│   ├── fragment_home.xml
│   ├── fragment_cart.xml
│   ├── fragment_order.xml
│   ├── fragment_profile.xml
│   ├── activity_product_list.xml
│   ├── activity_product_detail.xml
│   ├── activity_checkout.xml
│   ├── activity_payment_result.xml
│   ├── activity_delivery_address.xml
│   ├── activity_add_edit_address.xml
│   ├── activity_create_review.xml
│   ├── activity_admin_dashboard.xml
│   ├── item_product_grid.xml
│   ├── item_product_horizontal.xml
│   ├── item_cart.xml
│   ├── item_order.xml
│   ├── item_review.xml
│   ├── item_category.xml
│   └── item_address.xml
│
├── drawable/
│   ├── bg_button_primary.xml
│   ├── bg_input.xml
│   ├── bg_card.xml
│   ├── ic_cart.xml
│   ├── ic_home.xml
│   ├── ic_order.xml
│   └── ic_profile.xml
│
├── menu/
│   └── bottom_nav_menu.xml
│
├── values/
│   ├── colors.xml
│   ├── strings.xml
│   ├── dimens.xml
│   ├── styles.xml
│   └── themes.xml
```

---

## 5. Core setup

### 5.1 ApiConstants

```java
public class ApiConstants {
    public static final String BASE_URL = "http://10.0.2.2:6969/";
    public static final String API_PREFIX = "v1/api/";
}
```

Lưu ý:

- Android Emulator gọi localhost của máy host bằng `10.0.2.2`.
- Nếu chạy máy thật cùng mạng LAN, đổi `BASE_URL` thành IP máy chạy backend, ví dụ `http://192.168.1.10:6969/`.

### 5.2 RetrofitClient

```java
public class RetrofitClient {
    private static Retrofit retrofit;

    public static Retrofit getInstance(Context context) {
        if (retrofit == null) {
            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(new AuthInterceptor(context))
                    .addInterceptor(new HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY))
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(ApiConstants.BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
}
```

### 5.3 AuthInterceptor

```java
public class AuthInterceptor implements Interceptor {
    private final SessionManager sessionManager;

    public AuthInterceptor(Context context) {
        this.sessionManager = new SessionManager(context);
    }

    @NonNull
    @Override
    public Response intercept(@NonNull Chain chain) throws IOException {
        Request original = chain.request();
        String token = sessionManager.getAccessToken();

        if (token == null || token.isEmpty()) {
            return chain.proceed(original);
        }

        Request request = original.newBuilder()
                .addHeader("Authorization", "Bearer " + token)
                .build();

        return chain.proceed(request);
    }
}
```

### 5.4 SessionManager

Nhiệm vụ:

- Lưu access token
- Lưu refresh token
- Lưu user id/isAdmin nếu cần
- Clear session khi logout

```java
public class SessionManager {
    private static final String PREF_NAME = "uteshop_session";
    private static final String KEY_ACCESS_TOKEN = "access_token";
    private static final String KEY_REFRESH_TOKEN = "refresh_token";
    private static final String KEY_IS_ADMIN = "is_admin";

    private final SharedPreferences prefs;

    public SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public void saveTokens(String accessToken, String refreshToken) {
        prefs.edit()
                .putString(KEY_ACCESS_TOKEN, accessToken)
                .putString(KEY_REFRESH_TOKEN, refreshToken)
                .apply();
    }

    public String getAccessToken() {
        return prefs.getString(KEY_ACCESS_TOKEN, null);
    }

    public String getRefreshToken() {
        return prefs.getString(KEY_REFRESH_TOKEN, null);
    }

    public boolean isLoggedIn() {
        return getAccessToken() != null;
    }

    public void setAdmin(boolean isAdmin) {
        prefs.edit().putBoolean(KEY_IS_ADMIN, isAdmin).apply();
    }

    public boolean isAdmin() {
        return prefs.getBoolean(KEY_IS_ADMIN, false);
    }

    public void clear() {
        prefs.edit().clear().apply();
    }
}
```

---

## 6. API service layer

Tạo Retrofit interface theo feature.

### 6.1 AuthApi

```java
public interface AuthApi {
    @POST("v1/api/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("v1/api/register")
    Call<RegisterResponse> register(@Body RegisterRequest request);

    @POST("v1/api/verify-otp")
    Call<SimpleResponse> verifyOtp(@Body VerifyOtpRequest request);

    @POST("v1/api/resend-otp")
    Call<SimpleResponse> resendOtp(@Body ResendOtpRequest request);

    @POST("v1/api/refresh-token")
    Call<RefreshTokenResponse> refreshToken(@Body RefreshTokenRequest request);

    @POST("v1/api/forgot-password")
    Call<SimpleResponse> forgotPassword(@Body ForgotPasswordRequest request);
}
```

### 6.2 ProductApi

```java
public interface ProductApi {
    @GET("v1/api/products")
    Call<ProductListResponse> getProducts(
            @Query("page") int page,
            @Query("limit") int limit,
            @Query("category") String category,
            @Query("keyword") String keyword
    );

    @GET("v1/api/products/{id}")
    Call<ProductDetailResponse> getProductDetail(@Path("id") String id);

    @GET("v1/api/products/{id}/similar")
    Call<List<ProductListItem>> getSimilarProducts(@Path("id") String id);

    @GET("v1/api/products/top-viewed")
    Call<List<ProductListItem>> getTopViewedProducts();

    @GET("v1/api/products/top-discount")
    Call<List<ProductListItem>> getTopDiscountProducts();

    @GET("v1/api/newest")
    Call<List<ProductListItem>> getNewestProducts();

    @GET("v1/api/best-sellers")
    Call<List<ProductListItem>> getBestSellers(@Query("limit") int limit);
}
```

### 6.3 CategoryApi

```java
public interface CategoryApi {
    @GET("v1/api/categories")
    Call<List<Category>> getCategories();

    @GET("v1/api/categories/{slug}-{id}")
    Call<Category> getCategoryDetail(
            @Path("slug") String slug,
            @Path("id") String id
    );
}
```

### 6.4 CartApi

```java
public interface CartApi {
    @GET("v1/api/cart")
    Call<CartResponse> getCart();

    @GET("v1/api/cart/count")
    Call<CartCountResponse> getCartCount();

    @POST("v1/api/cart/add")
    Call<CartMutationResponse> addToCart(@Body AddToCartRequest request);

    @PUT("v1/api/cart/update")
    Call<CartUpdateResponse> updateCartItem(@Body UpdateCartItemRequest request);

    @DELETE("v1/api/cart/remove/{productId}")
    Call<CartMutationResponse> removeFromCart(@Path("productId") String productId);

    @DELETE("v1/api/cart/clear")
    Call<SimpleResponse> clearCart();
}
```

### 6.5 OrderApi

```java
public interface OrderApi {
    @GET("v1/api/orders/count")
    Call<OrderCountResponse> getOrderCount();

    @GET("v1/api/orders")
    Call<OrderListResponse> getOrders(@Query("status") String status);

    @PUT("v1/api/orders/{orderId}/status")
    Call<OrderUpdateResponse> updateOrderStatus(
            @Path("orderId") String orderId,
            @Body UpdateOrderStatusRequest request
    );

    @GET("v1/api/orders/user/{userId}")
    Call<OrderListResponse> getOrdersByUserId(@Path("userId") String userId);
}
```

### 6.6 PaymentApi

```java
public interface PaymentApi {
    @POST("v1/api/payment/create-qr")
    Call<CreatePaymentResponse> createPayment(@Body CreatePaymentRequest request);
}
```

VNPay callback `/payment/vnpay_return` là redirect từ VNPay về backend, mobile thường không gọi trực tiếp.

### 6.7 UserApi

```java
public interface UserApi {
    @GET("v1/api/profile")
    Call<ProfileResponse> getProfile();

    @PUT("v1/api/update-profile")
    Call<ProfileUpdateResponse> updateProfile(@Body UpdateProfileRequest request);

    @POST("v1/api/user/viewed-products")
    Call<SimpleResponse> addViewedProduct(@Body ProductIdRequest request);

    @POST("v1/api/user/favorite-products")
    Call<ToggleFavoriteResponse> toggleFavoriteProduct(@Body ProductIdRequest request);
}
```

### 6.8 DeliveryAddressApi

```java
public interface DeliveryAddressApi {
    @GET("v1/api/user/delivery-addresses")
    Call<DeliveryAddressListResponse> getAddresses();

    @POST("v1/api/user/delivery-addresses")
    Call<DeliveryAddressResponse> createAddress(@Body DeliveryAddressRequest request);

    @PUT("v1/api/user/delivery-addresses/{id}")
    Call<DeliveryAddressResponse> updateAddress(
            @Path("id") String id,
            @Body DeliveryAddressRequest request
    );

    @PUT("v1/api/user/delivery-addresses/{id}/default")
    Call<DeliveryAddressResponse> setDefault(@Path("id") String id);

    @DELETE("v1/api/user/delivery-addresses/{id}")
    Call<DeliveryAddressResponse> deleteAddress(@Path("id") String id);
}
```

### 6.9 ReviewApi

```java
public interface ReviewApi {
    @GET("v1/api/products/{productId}/reviews")
    Call<ReviewListResponse> getReviewsByProduct(@Path("productId") String productId);

    @GET("v1/api/reviews")
    Call<ReviewListResponse> getMyReviews();

    @POST("v1/api/reviews")
    Call<CreateReviewResponse> createReview(@Body CreateReviewRequest request);
}
```

### 6.10 VoucherApi

```java
public interface VoucherApi {
    @GET("v1/api/voucher/my")
    Call<MyVoucherResponse> getMyVouchers();
}
```

### 6.11 AdminApi

```java
public interface AdminApi {
    @GET("v1/api/admin/stats/revenue")
    Call<RevenueStatsResponse> getRevenueStats(
            @Query("from") String from,
            @Query("to") String to,
            @Query("groupBy") String groupBy
    );

    @GET("v1/api/admin/stats/users")
    Call<UserStatsResponse> getUserStats(
            @Query("from") String from,
            @Query("to") String to,
            @Query("groupBy") String groupBy
    );

    @GET("v1/api/admin/orders")
    Call<OrderListResponse> getAdminOrders(@Query("status") String status);

    @PUT("v1/api/admin/orders/{orderId}/status")
    Call<OrderUpdateResponse> updateAdminOrderStatus(
            @Path("orderId") String orderId,
            @Body AdminUpdateOrderStatusRequest request
    );

    @GET("v1/api/admin/users")
    Call<AdminUserListResponse> getUsers(
            @Query("page") int page,
            @Query("limit") int limit,
            @Query("keyword") String keyword
    );

    @PUT("v1/api/admin/users/{userId}/active")
    Call<ProfileResponse> toggleUserActive(
            @Path("userId") String userId,
            @Body ToggleUserActiveRequest request
    );

    @GET("v1/api/admin/products")
    Call<ProductListResponse> getAdminProducts(
            @Query("page") int page,
            @Query("limit") int limit,
            @Query("category") String category,
            @Query("keyword") String keyword
    );

    @POST("v1/api/admin/products")
    Call<ProductMutationResponse> createProduct(@Body ProductMutationRequest request);

    @PUT("v1/api/admin/products/{id}")
    Call<ProductMutationResponse> updateProduct(
            @Path("id") String id,
            @Body ProductMutationRequest request
    );

    @DELETE("v1/api/admin/products/{id}")
    Call<SimpleResponse> deleteProduct(@Path("id") String id);

    @POST("v1/api/admin/categories")
    Call<CategoryMutationResponse> createCategory(@Body CategoryMutationRequest request);
}
```

---

## 7. Data model/DTO layer

### 7.1 Model dùng cho UI

Tạo trong:

```txt
data/model/
```

Danh sách model chính:

```txt
User.java
Product.java
ProductImage.java
Category.java
Cart.java
CartItem.java
Order.java
OrderItem.java
Review.java
Voucher.java
DeliveryAddress.java
```

Model dùng lại ở nhiều màn hình, ví dụ product card, cart item, order detail.

### 7.2 Request DTO

Tạo trong:

```txt
data/remote/dto/request/
```

Các file nên tạo trước:

```txt
LoginRequest.java
RegisterRequest.java
VerifyOtpRequest.java
ResendOtpRequest.java
RefreshTokenRequest.java
ForgotPasswordRequest.java
AddToCartRequest.java
UpdateCartItemRequest.java
CreatePaymentRequest.java
UpdateOrderStatusRequest.java
DeliveryAddressRequest.java
CreateReviewRequest.java
UpdateProfileRequest.java
ProductIdRequest.java
```

### 7.3 Response DTO

Tạo trong:

```txt
data/remote/dto/response/
```

Các file nên tạo trước:

```txt
SimpleResponse.java
LoginResponse.java
RegisterResponse.java
RefreshTokenResponse.java
ProductListResponse.java
ProductDetailResponse.java
CartResponse.java
CartCountResponse.java
CartMutationResponse.java
CartUpdateResponse.java
OrderListResponse.java
OrderCountResponse.java
OrderUpdateResponse.java
CreatePaymentResponse.java
ProfileResponse.java
ProfileUpdateResponse.java
ToggleFavoriteResponse.java
DeliveryAddressListResponse.java
DeliveryAddressResponse.java
ReviewListResponse.java
CreateReviewResponse.java
MyVoucherResponse.java
```

---

## 8. Repository layer

Mỗi feature có repository riêng.

```txt
repository/AuthRepository.java
repository/ProductRepository.java
repository/CategoryRepository.java
repository/CartRepository.java
repository/OrderRepository.java
repository/PaymentRepository.java
repository/ReviewRepository.java
repository/UserRepository.java
repository/VoucherRepository.java
repository/DeliveryAddressRepository.java
repository/AdminRepository.java
```

Repository chịu trách nhiệm:

- Gọi API service
- Xử lý response success/error
- Lưu token khi login
- Clear session khi logout
- Map DTO sang model nếu cần
- Không để Activity/Fragment gọi Retrofit trực tiếp

Ví dụ flow login:

```txt
LoginActivity
  -> AuthViewModel.login()
  -> AuthRepository.login()
  -> AuthApi.login()
  -> SessionManager.saveTokens()
  -> Navigate MainActivity
```

---

## 9. UI/UX cơ bản theo feature

## 9.1 Navigation chính

Dùng `MainActivity` + Bottom Navigation:

```txt
Home | Cart | Orders | Profile
```

Fragments:

```txt
HomeFragment
CartFragment
OrderFragment
ProfileFragment
```

Rule:

- User chưa login bấm Cart/Orders/Profile thì redirect sang `LoginActivity`.
- User login rồi thì giữ trong Main.
- Nếu `user.isAdmin = true`, Profile có nút vào Admin Dashboard.

---

## 9.2 Auth UI

### LoginActivity

Fields:

- Username/email
- Password

Actions:

- Đăng nhập
- Chuyển đăng ký
- Chuyển quên mật khẩu

UX:

- Loading khi gọi API
- Disable button khi loading
- Toast hoặc TextInputLayout error khi lỗi

### RegisterActivity

Fields:

- Full name
- Email
- Username
- Password
- Phone optional
- Gender optional
- Date of birth optional

Flow:

```txt
Register success -> VerifyOtpActivity(email)
```

### VerifyOtpActivity

Fields:

- Email readonly hoặc lấy từ Intent
- OTP

Actions:

- Verify OTP
- Resend OTP

### ForgotPasswordActivity

Fields:

- Email
- OTP
- New password

Actions:

- Submit đổi mật khẩu

---

## 9.3 Home UI

Sections:

```txt
Search bar
Category horizontal list
Newest products
Best sellers
Top discount
Top viewed
```

Components:

- RecyclerView horizontal cho category
- RecyclerView horizontal cho các product section
- Product card gồm:
  - image
  - name
  - price
  - discount price
  - sold/views optional

Click product:

```txt
ProductDetailActivity(productId)
```

Click search:

```txt
ProductListActivity(keyword)
```

Click category:

```txt
ProductListActivity(category)
```

---

## 9.4 Product list UI

Dùng cho:

- Search result
- Category result
- View all section

UI:

- Grid 2 columns
- Pull to refresh
- Pagination basic khi scroll cuối list
- Empty state nếu không có sản phẩm

API:

```txt
GET /v1/api/products?page=1&limit=10&category=&keyword=
```

---

## 9.5 Product detail UI

Hiển thị:

- Image carousel hoặc RecyclerView ngang
- Product name
- Price
- Discount price
- Description
- Category
- Views
- Sold
- Average rating
- Reviews list
- Similar products

Actions:

- Add to cart
- Toggle favorite
- Back

Khi mở detail nên gọi:

```txt
GET /v1/api/products/:id
POST /v1/api/user/viewed-products
```

`POST viewed-products` chỉ gọi nếu đã login.

---

## 9.6 Cart UI

Hiển thị:

- List cart item
- Product image/name/price
- Quantity controls `+`, `-`
- Remove item
- Total price
- Checkout button

Lưu ý API:

```txt
PUT /v1/api/cart/update
```

Backend hiện tại đang cộng thêm quantity, không set quantity tuyệt đối.

FE xử lý:

```txt
Bấm + -> gửi quantity = 1
Bấm - -> gửi quantity = -1
```

---

## 9.7 Checkout UI

Hiển thị/input:

- Selected cart items
- Delivery address selector
- Voucher code
- Used xu
- Payment type:
  - COD
  - VNPay
- Total price

API:

```txt
POST /v1/api/payment/create-qr
```

Flow:

```txt
Nếu response có orderId -> COD success -> PaymentResultActivity
Nếu response có url -> mở Browser/WebView để thanh toán VNPay
```

Lưu ý VNPay:

- Backend hiện redirect về `http://localhost:3000/payment-callback`.
- Với mobile thật, cần chỉnh backend sang deep link hoặc mobile callback sau.
- Giai đoạn demo có thể mở browser để thanh toán và reload Orders sau khi quay lại app.

---

## 9.8 Orders UI

Tabs:

```txt
All | Pending | Preparing | Delivering | Delivered | Cancelled
```

API:

```txt
GET /v1/api/orders?status=pending
```

Actions:

- Nếu `pending`: cho hủy đơn.
- Nếu `delivering`: cho xác nhận đã nhận.
- Nếu `delivered`: cho đánh giá sản phẩm.

Lưu ý cập nhật status:

```txt
PUT /v1/api/orders/:orderId/status
```

FE gửi trạng thái hiện tại, backend tự đổi trạng thái mới:

```json
{ "statusOrder": "pending" }
```

Backend đổi sang `cancelled`.

```json
{ "statusOrder": "delivering" }
```

Backend đổi sang `delivered`.

---

## 9.9 Profile UI

Hiển thị:

- Avatar
- Full name
- Email
- Username
- Phone
- Xu
- Menu action

Menu:

```txt
Edit profile
Delivery addresses
My vouchers
My reviews
Favorite products
Logout
Admin dashboard nếu isAdmin = true
```

---

## 9.10 Delivery Address UI

Screens:

```txt
DeliveryAddressActivity
AddEditAddressActivity
```

Features:

- List address
- Add address
- Edit address
- Delete address
- Set default

Fields:

- addressName
- nameBuyer
- phoneNumber
- note
- defaultAddress

---

## 9.11 Review UI

Screen:

```txt
CreateReviewActivity
```

Input:

- Rating 1-5
- Comment

Flow:

```txt
Delivered order item -> CreateReviewActivity(orderId, productId)
POST /v1/api/reviews
Show reward voucher/xu sau khi review success
```

---

## 9.12 Admin UI cơ bản

Nếu `user.isAdmin = true`, hiển thị Admin entry.

Screens:

```txt
AdminDashboardActivity
AdminOrderActivity
AdminProductActivity
AdminUserActivity
```

Features cơ bản:

- Revenue stats
- User stats
- Orders list/update status
- Product list/create/update/delete
- User active toggle

---

## 10. Thứ tự implement đề xuất

### Sprint 1: Setup project

1. Tạo Android Java project.
2. Add dependencies.
3. Setup package structure.
4. Setup Retrofit.
5. Setup SessionManager.
6. Setup BaseActivity/BaseFragment.
7. Setup theme/colors/basic UI components.

### Sprint 2: Auth

1. Login.
2. Register.
3. Verify OTP.
4. Forgot password.
5. Save token.
6. Auto redirect nếu đã login.

### Sprint 3: Home/Product

1. Home screen.
2. Product APIs.
3. Product list.
4. Product detail.
5. Add to cart.
6. Favorite/viewed.

### Sprint 4: Cart/Checkout

1. Cart screen.
2. Update/remove/clear cart.
3. Delivery address CRUD.
4. Voucher/xu.
5. Checkout COD.
6. VNPay basic browser flow.

### Sprint 5: Orders/Review/Profile

1. Orders list.
2. Order status update.
3. Review product.
4. Profile edit.
5. My vouchers.
6. Address management.

### Sprint 6: Admin basic

1. Admin dashboard.
2. Admin orders.
3. Admin products.
4. Admin users.

---

## 11. Files nên tạo đầu tiên

```txt
core/config/AppConfig.java
core/constants/ApiConstants.java
core/network/RetrofitClient.java
core/network/AuthInterceptor.java
core/storage/SessionManager.java

core/base/BaseActivity.java
core/base/BaseFragment.java
core/base/BaseResponse.java

data/remote/api/AuthApi.java
data/remote/api/ProductApi.java
data/remote/api/CartApi.java
data/remote/api/OrderApi.java

data/remote/dto/request/LoginRequest.java
data/remote/dto/response/LoginResponse.java
data/remote/dto/response/SimpleResponse.java

repository/AuthRepository.java
repository/ProductRepository.java

ui/auth/LoginActivity.java
ui/main/MainActivity.java
ui/home/HomeFragment.java
```

---

## 12. Naming convention

### Java class

```txt
LoginActivity
AuthRepository
ProductApi
ProductListResponse
CreateOrderRequest
```

### XML layout

```txt
activity_login.xml
fragment_home.xml
item_product_grid.xml
```

### Drawable

```txt
bg_button_primary.xml
bg_card_product.xml
ic_cart.xml
```

### IDs trong XML

```txt
edtUsername
edtPassword
btnLogin
rvProducts
tvProductName
imgProduct
```

---

## 13. UI style cơ bản

### Color palette đề xuất

```xml
<color name="colorPrimary">#1E88E5</color>
<color name="colorPrimaryDark">#1565C0</color>
<color name="colorAccent">#FFB300</color>
<color name="colorBackground">#F7F8FA</color>
<color name="colorTextPrimary">#212121</color>
<color name="colorTextSecondary">#757575</color>
<color name="colorError">#E53935</color>
<color name="colorSuccess">#43A047</color>
```

### Component style

- Button chính: bo góc 8-12dp, màu primary.
- Product card: nền trắng, bo góc 12dp, shadow nhẹ.
- Input: TextInputLayout hoặc EditText nền bo góc.
- App spacing: 16dp ngang, 8-12dp giữa component.
- Product grid: 2 columns.
- Image ratio product card: 1:1 hoặc 4:3.

---

## 14. Các lưu ý quan trọng khi tích hợp backend

1. Base URL emulator dùng `http://10.0.2.2:6969/`.
2. Protected API cần header `Authorization: Bearer <accessToken>`.
3. Admin API cần token có `isAdmin = true` trong JWT payload.
4. `PUT /v1/api/cart/update` cộng thêm quantity, không set quantity tuyệt đối.
5. `PUT /v1/api/orders/:orderId/status` nhận trạng thái hiện tại để backend suy ra trạng thái mới.
6. VNPay callback hiện redirect về web FE `http://localhost:3000/payment-callback`; mobile cần xử lý riêng nếu muốn production-ready.
7. Một số route public của backend có vẻ nên là admin theo nghiệp vụ, nhưng mobile nên ưu tiên dùng admin routes chính thức:
   - Dùng `POST /v1/api/admin/products` thay vì `POST /v1/api/create-products`.
   - Dùng `POST /v1/api/admin/categories` thay vì `POST /v1/api/categories` khi thao tác admin.

---

## 15. Kết luận

Hướng setup đề xuất:

```txt
Native Android Java
+ XML UI
+ MVVM nhẹ
+ Repository Pattern
+ Retrofit/OkHttp/Gson
+ Glide
+ SharedPreferences token
+ Feature-based UI folders
```

Cấu trúc này đủ sạch cho app shop/mobile đồ án, không quá phức tạp như multi-module Gradle, nhưng vẫn tách layer rõ để team code song song và dễ mở rộng sau này.
