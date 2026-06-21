# UTEShop Client API Documentation

Tài liệu này tổng hợp API phía client từ route/controller/service/model hiện tại của backend. Các endpoint notification đã được bỏ qua theo yêu cầu.

## Thông tin chung

- Base URL local theo code: `http://localhost:6969`
- Base API path: `/v1/api/`
- Protected route dùng header:

```http
Authorization: Bearer <accessToken>
```

- Response lỗi phổ biến:

```ts
interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  error?: string;
}
```

- Lưu ý auth:
  - Đa số protected API lấy user từ JWT payload `req.user.userId`.
  - Riêng `PUT /update-profile` chạy thêm middleware load user document và dùng `req.user._id`.

## Shared interfaces

```ts
type ObjectId = string;
type ISODateString = string;

type OrderPaymentStatus = "pending" | "paid" | "failed" | "cod";
type OrderStatus = "pending" | "preparing" | "delivering" | "delivered" | "cancelled";
type ProductStatus = "available" | "out_of_stock" | "deleted";
type VoucherType = "percentage" | "fixed";

interface ApiSuccess<T> {
  success: true;
  message?: string;
  data?: T;
}

interface Pagination {
  currentPage?: number;
  page?: number;
  limit?: number;
  total?: number;
  totalPages: number;
  totalProducts?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

interface User {
  _id: ObjectId;
  fullName: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: ISODateString;
  avt?: string;
  email: string;
  username: string;
  isActive: boolean;
  xu?: number;
  isAdmin: boolean;
  viewedProducts?: ObjectId[];
  favProducts?: ObjectId[];
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

interface Category {
  _id: ObjectId;
  name: string;
  description?: string;
  slug?: string;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

interface ProductImage {
  _id?: ObjectId;
  product?: ObjectId;
  url: string;
  alt?: string;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

interface Product {
  _id: ObjectId;
  name: string;
  quantity: number;
  sold: number;
  description?: string;
  price: number;
  discount: number;
  category?: ObjectId | Category | { name?: string; slug?: string; description?: string };
  views: number;
  images?: ProductImage[] | ObjectId[];
  slug?: string;
  status: ProductStatus;
  isNew?: boolean;
  isHot?: boolean;
  stock?: number;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

interface ProductListItem {
  _id: ObjectId;
  name: string;
  price: number;
  discount: number;
  sold: number;
  views: number;
  createdAt?: ISODateString;
  discountAmount?: number;
  category?: { name?: string; slug?: string };
  images?: ProductImage[];
}

interface Review {
  _id: ObjectId;
  product: ObjectId | Product | { name?: string; images?: ProductImage[] };
  user: ObjectId | Pick<User, "_id" | "fullName" | "avt" | "email">;
  rating: number;
  comment?: string;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

interface CartItem {
  product: ObjectId | Product;
  quantity: number;
}

interface Cart {
  _id: ObjectId;
  user: ObjectId;
  items: CartItem[];
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

interface DeliveryAddress {
  _id: ObjectId;
  addressName: string;
  defaultAddress: boolean;
  nameBuyer: string;
  buyerId: ObjectId;
  phoneNumber?: string;
  note?: string;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

interface Voucher {
  id: ObjectId;
  code: string;
  type: VoucherType;
  discountValue: number;
  startDate: ISODateString;
  expiryDate: ISODateString;
  minOrderValue: number;
  usageLimit: number;
  isPublic: boolean;
  usedCount: number;
  maxUsagePerUser: number;
  assignedDate: ISODateString;
}

interface OrderItem {
  product: ObjectId | Product;
  quantity: number;
  isCommented?: boolean;
}

interface Order {
  _id: ObjectId;
  user: ObjectId | Pick<User, "username" | "email">;
  items: OrderItem[];
  totalPrice: number;
  status: OrderPaymentStatus;
  statusOrder: OrderStatus;
  isDelivered: boolean;
  paymentInfo?: Record<string, unknown>;
  voucher?: ObjectId;
  discountAmount: number;
  usedXu: number;
  deliveryAddressId: ObjectId | DeliveryAddress;
  autoUpdate?: ISODateString | null;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}
```

---

# 1. System

## 1.1 Kiểm tra API

```http
GET /v1/api/
```

- Auth: public
- Công dụng: kiểm tra API server đang chạy.

Response `200`:

```ts
interface RootResponse {
  message: "UTEShop API";
}
```

---

# 2. Authentication

## 2.1 Đăng ký tài khoản

```http
POST /v1/api/register
```

- Auth: public
- Công dụng: tạo user chưa active, hash password, gửi OTP qua email.

Request body:

```ts
interface RegisterRequest {
  fullName: string;       // required, 2-100 ký tự, chữ và khoảng trắng
  email: string;          // required, email hợp lệ
  username: string;       // required, 3-30 ký tự, chữ/số/_
  password: string;       // required, >= 6, có chữ hoa/thường/số/ký tự đặc biệt
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string;   // date hợp lệ, tuổi 13-120
  avt?: string;           // filename ảnh theo DTO hiện tại
}
```

Response `201`:

```ts
interface RegisterResponse {
  success: true;
  message: string;
  data: User; // không có password, otp, otpGeneratedTime
}
```

Lỗi thường gặp:
- `400`: thiếu `fullName`, `email`, `username`, `password`; password yếu; email/username đã tồn tại; validation failed.

## 2.2 Đăng nhập

```http
POST /v1/api/login
```

- Auth: public
- Công dụng: đăng nhập bằng username hoặc email, trả access/refresh token.

Request body:

```ts
interface LoginRequest {
  username: string; // username hoặc email
  password: string;
}
```

Response `200`:

```ts
interface LoginResponse {
  success: true;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}
```

Lỗi thường gặp:
- `401`: sai thông tin đăng nhập hoặc tài khoản chưa active.

## 2.3 Xác thực OTP

```http
POST /v1/api/verify-otp
```

- Auth: public
- Công dụng: xác thực OTP để active tài khoản.

Request body:

```ts
interface VerifyOtpRequest {
  email: string;
  otp: string; // 6 chữ số
}
```

Response `200`:

```ts
interface VerifyOtpResponse {
  success: true;
  message: string;
}
```

## 2.4 Gửi lại OTP

```http
POST /v1/api/resend-otp
```

- Auth: public
- Công dụng: gửi lại OTP cho email.

Request body:

```ts
interface ResendOtpRequest {
  email: string;
}
```

Response `200`:

```ts
interface ResendOtpResponse {
  success: true;
  message: string;
}
```

## 2.5 Refresh access token

```http
POST /v1/api/refresh-token
```

- Auth: public
- Công dụng: đổi refresh token lấy access token mới.

Request body:

```ts
interface RefreshTokenRequest {
  refreshToken: string;
}
```

Response `200`:

```ts
interface RefreshTokenResponse {
  success: true;
  message: string;
  data: {
    accessToken: string;
  };
}
```

## 2.6 Quên mật khẩu / đặt mật khẩu mới

```http
POST /v1/api/forgot-password
```

- Auth: public
- Công dụng: xác thực OTP và đổi mật khẩu theo email.

Request body theo controller:

```ts
interface ForgotPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}
```

Lưu ý: middleware validation hiện tại chỉ validate `newPassword`, nhưng controller vẫn đọc `email` và `otp`.

Response `200`:

```ts
interface ForgotPasswordResponse {
  success: true;
  message: string;
}
```

---

# 3. Product & Category

## 3.1 Lấy sản phẩm xem nhiều

```http
GET /v1/api/products/top-viewed
```

- Auth: public
- Công dụng: lấy top 8 sản phẩm `available` theo `views` giảm dần.

Response `200`:

```ts
type TopViewedProductsResponse = ProductListItem[];
```

## 3.2 Lấy sản phẩm giảm giá cao nhất

```http
GET /v1/api/products/top-discount
```

- Auth: public
- Công dụng: lấy top 4 sản phẩm `available` theo số tiền giảm cao nhất.

Response `200`:

```ts
type TopDiscountProductsResponse = ProductListItem[]; // có thêm discountAmount
```

## 3.3 Lấy sản phẩm mới nhất

```http
GET /v1/api/newest
```

- Auth: public
- Công dụng: lấy top 8 sản phẩm `available` mới nhất.

Response `200`:

```ts
type NewestProductsResponse = ProductListItem[];
```

## 3.4 Lấy sản phẩm bán chạy

```http
GET /v1/api/best-sellers?limit=6
```

- Auth: public
- Công dụng: lấy sản phẩm `available` theo `sold` giảm dần.

Query params:

```ts
interface BestSellersQuery {
  limit?: number; // default 6
}
```

Response `200`:

```ts
type BestSellersResponse = ProductListItem[];
```

## 3.5 Danh sách sản phẩm có phân trang/search/filter

```http
GET /v1/api/products?page=1&limit=5&category=<slug-id|id>&keyword=<text>
```

- Auth: public
- Công dụng: lấy danh sách sản phẩm không bị `deleted`, có phân trang, lọc category, search fuzzy theo tên.

Query params:

```ts
interface ProductListQuery {
  page?: number;     // default 1
  limit?: number;    // default 5
  category?: string; // có thể là ObjectId hoặc chuỗi dạng slug-id; service lấy phần sau dấu '-'
  keyword?: string;  // search fuzzy theo name bằng Fuse.js
}
```

Response `200`:

```ts
interface ProductListResponse {
  success: true;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
  };
}
```

## 3.6 Chi tiết sản phẩm

```http
GET /v1/api/products/:id
```

- Auth: public
- Công dụng: lấy chi tiết sản phẩm, tăng `views` +1, kèm ảnh, review và rating trung bình.

Path params:

```ts
interface ProductDetailParams {
  id: ObjectId;
}
```

Response `200`:

```ts
interface ProductDetailResponse {
  success: true;
  data: Product & {
    images: Pick<ProductImage, "url" | "alt">[];
    reviews: Pick<Review, "rating" | "comment" | "createdAt">[];
    avgRating: string | null;
  };
}
```

Lỗi thường gặp:
- `400`: product id không hợp lệ.
- `404`: không tìm thấy product.

## 3.7 Sản phẩm tương tự

```http
GET /v1/api/products/:id/similar
```

- Auth: public
- Công dụng: lấy tối đa 6 sản phẩm cùng category, khác sản phẩm hiện tại, `status = available`.

Response `200`:

```ts
type SimilarProductsResponse = ProductListItem[];
```

## 3.8 Tạo sản phẩm public route hiện tại

```http
POST /v1/api/create-products
```

- Auth: public theo route hiện tại.
- Công dụng: tạo 1 hoặc nhiều sản phẩm. Route này trông giống tác vụ admin nhưng hiện chưa bị chặn bởi auth/admin.

Request body:

```ts
type CreateProductsRequest = Partial<Product> | Partial<Product>[];
```

Response `201`:

```ts
type CreateProductsResponse =
  | { success: true; message: string; product: Product }
  | { success: true; message: string; products: Product[] };
```

## 3.9 Tạo category public route hiện tại

```http
POST /v1/api/categories
```

- Auth: public theo route hiện tại.
- Công dụng: tạo category, tự sinh slug.

Request body:

```ts
interface CreateCategoryRequest {
  name: string;
  description?: string;
}
```

Response `201`:

```ts
type CreateCategoryResponse = Category;
```

## 3.10 Danh sách category

```http
GET /v1/api/categories
```

- Auth: public
- Công dụng: lấy danh sách category.

Response `200`:

```ts
type CategoryListResponse = Pick<Category, "_id" | "name" | "description" | "slug">[];
```

## 3.11 Chi tiết category

```http
GET /v1/api/categories/:slug-:id
```

- Auth: public
- Công dụng: lấy category theo phần `id` sau dấu `-`.

Ví dụ path: `/v1/api/categories/ao-thun-66f...`

Response `200`:

```ts
type CategoryDetailResponse = Category;
```

Lỗi thường gặp:
- `404`: `{ error: "Not found" }`

---

# 4. Review

## 4.1 Lấy review của sản phẩm

```http
GET /v1/api/products/:productId/reviews
```

- Auth: public
- Công dụng: lấy review theo product, có populate thông tin user.

Path params:

```ts
interface ProductReviewsParams {
  productId: ObjectId;
}
```

Response `200`:

```ts
interface ProductReviewsResponse {
  success: true;
  count: number;
  data: (Review & {
    user: Pick<User, "_id" | "fullName" | "avt" | "email">;
  })[];
}
```

## 4.2 Lấy review của user hiện tại

```http
GET /v1/api/reviews
```

- Auth: required
- Công dụng: lấy các review của user đang đăng nhập, sort mới nhất trước.

Response `200`:

```ts
interface MyReviewsResponse {
  success: true;
  count: number;
  data: (Review & {
    product: Pick<Product, "_id" | "name" | "images">;
  })[];
}
```

## 4.3 Tạo review

```http
POST /v1/api/reviews
```

- Auth: required
- Công dụng: review một sản phẩm trong order đã giao; đánh dấu item đã comment; tạo reward là voucher hoặc xu.

Request body:

```ts
interface CreateReviewRequest {
  orderId: ObjectId;
  productId: ObjectId;
  rating: number;   // 1-5
  comment?: string;
}
```

Response `201`:

```ts
type ReviewReward =
  | {
      type: "voucher";
      code: string;
      discountValue: number;
      discountType: VoucherType;
      expiryDate: ISODateString;
    }
  | {
      type: "points";
      amount: number;
    };

interface CreateReviewResponse {
  success: true;
  data: Review & { product?: Pick<Product, "name"> };
  reward: ReviewReward;
}
```

Điều kiện backend kiểm tra:
- Order tồn tại.
- Order thuộc user đang đăng nhập.
- `order.statusOrder === "delivered"`.
- Product trong order chưa được review (`isCommented = false`).

---

# 5. User Profile / Viewed / Favorite

## 5.1 Lấy profile user hiện tại

```http
GET /v1/api/profile
```

- Auth: required
- Công dụng: lấy thông tin user hiện tại.

Response `200`:

```ts
interface ProfileResponse {
  success: true;
  data: User;
}
```

## 5.2 Cập nhật profile

```http
PUT /v1/api/update-profile
```

- Auth: required
- Công dụng: cập nhật các field profile được cho phép.

Request body:

```ts
interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string;
  avt?: string;
}
```

Response `200`:

```ts
interface UpdateProfileResponse {
  success: true;
  message: "Profile updated successfully";
  data: User;
}
```

## 5.3 Thêm sản phẩm đã xem

```http
POST /v1/api/user/viewed-products
```

- Auth: required
- Công dụng: thêm product vào `viewedProducts` nếu chưa tồn tại.

Request body:

```ts
interface AddViewedProductRequest {
  productId: ObjectId;
}
```

Response `200`:

```ts
interface AddViewedProductResponse {
  success: true;
  message: "Added to viewed products successfully";
}
```

## 5.4 Toggle sản phẩm yêu thích

```http
POST /v1/api/user/favorite-products
```

- Auth: required
- Công dụng: nếu product chưa yêu thích thì thêm, nếu đã có thì xóa.

Request body:

```ts
interface ToggleFavoriteProductRequest {
  productId: ObjectId;
}
```

Response `200`:

```ts
interface ToggleFavoriteProductResponse {
  success: true;
  message: string;
  isFavorited: boolean;
}
```

---

# 6. Delivery Address

## 6.1 Lấy danh sách địa chỉ giao hàng

```http
GET /v1/api/user/delivery-addresses
```

- Auth: required
- Công dụng: lấy địa chỉ của user hiện tại, sort default trước rồi mới nhất trước.

Response `200`:

```ts
interface DeliveryAddressListResponse {
  success: true;
  data: DeliveryAddress[];
}
```

## 6.2 Tạo địa chỉ giao hàng

```http
POST /v1/api/user/delivery-addresses
```

- Auth: required
- Công dụng: tạo địa chỉ giao hàng; nếu `defaultAddress = true` thì unset default cũ.

Request body:

```ts
interface CreateDeliveryAddressRequest {
  addressName: string;
  defaultAddress?: boolean;
  nameBuyer: string;
  phoneNumber?: string;
  note?: string;
}
```

Response `201`:

```ts
interface CreateDeliveryAddressResponse {
  success: true;
  data: DeliveryAddress;
}
```

## 6.3 Cập nhật địa chỉ giao hàng

```http
PUT /v1/api/user/delivery-addresses/:id
```

- Auth: required
- Công dụng: cập nhật địa chỉ thuộc user hiện tại.

Request body:

```ts
type UpdateDeliveryAddressRequest = Partial<CreateDeliveryAddressRequest>;
```

Response `200`:

```ts
interface UpdateDeliveryAddressResponse {
  success: true;
  data: DeliveryAddress;
}
```

## 6.4 Đặt địa chỉ mặc định

```http
PUT /v1/api/user/delivery-addresses/:id/default
```

- Auth: required
- Công dụng: set địa chỉ làm mặc định, unset default các địa chỉ khác.

Response `200`:

```ts
interface SetDefaultDeliveryAddressResponse {
  success: true;
  data: DeliveryAddress;
}
```

## 6.5 Xóa địa chỉ giao hàng

```http
DELETE /v1/api/user/delivery-addresses/:id
```

- Auth: required
- Công dụng: xóa địa chỉ thuộc user hiện tại.

Response `200`:

```ts
interface DeleteDeliveryAddressResponse {
  success: true;
  data: DeliveryAddress;
}
```

---

# 7. Cart

## 7.1 Lấy giỏ hàng

```http
GET /v1/api/cart
```

- Auth: required
- Công dụng: lấy cart hiện tại, populate product/images, tính tổng item và tổng tiền sau discount.

Response `200`:

```ts
interface CartResponse {
  success: true;
  message: string;
  data: {
    items: (CartItem & {
      product: Pick<Product, "_id" | "name" | "price" | "discount" | "images">;
    })[];
    totalItems: number;
    totalPrice: number;
  };
}
```

Nếu chưa có cart:

```ts
{
  success: true,
  message: "Giỏ hàng trống",
  data: { items: [], totalItems: 0, totalPrice: 0 }
}
```

## 7.2 Lấy số lượng item trong giỏ

```http
GET /v1/api/cart/count
```

- Auth: required
- Công dụng: tính tổng quantity trong cart.

Response `200`:

```ts
interface CartCountResponse {
  success: true;
  message: string;
  data: { count: number };
}
```

## 7.3 Thêm vào giỏ hàng

```http
POST /v1/api/cart/add
```

- Auth: required
- Công dụng: thêm sản phẩm vào giỏ; nếu đã có thì cộng thêm quantity.

Request body:

```ts
interface AddToCartRequest {
  productId: ObjectId;
  quantity?: number; // default 1, phải > 0
}
```

Response `200`:

```ts
interface AddToCartResponse {
  success: true;
  message: "Thêm vào giỏ hàng thành công";
  data: Cart;
}
```

Lỗi thường gặp:
- `404`: sản phẩm không tồn tại hoặc đã deleted.
- `400`: quantity vượt tồn kho.

## 7.4 Cập nhật quantity item trong giỏ

```http
PUT /v1/api/cart/update
```

- Auth: required
- Công dụng: cộng thêm `quantity` vào quantity hiện tại của item.
- Lưu ý: đây không phải set absolute quantity, service đang tính `newQuantity = currentQuantity + quantity`.

Request body:

```ts
interface UpdateCartItemRequest {
  productId: ObjectId;
  quantity: number;
}
```

Response `200`:

```ts
interface UpdateCartItemResponse {
  success: true;
  message: "Cập nhật giỏ hàng thành công";
  data: {
    success: true;
    status: 200;
    message: "Cập nhật thành công";
    data: Cart;
  };
}
```

## 7.5 Xóa một sản phẩm khỏi giỏ

```http
DELETE /v1/api/cart/remove/:productId
```

- Auth: required
- Công dụng: remove item theo productId.

Response `200`:

```ts
interface RemoveFromCartResponse {
  success: true;
  message: "Xóa sản phẩm khỏi giỏ hàng thành công";
  data: Cart;
}
```

## 7.6 Xóa toàn bộ giỏ hàng

```http
DELETE /v1/api/cart/clear
```

- Auth: required
- Công dụng: clear toàn bộ items trong cart.

Response `200`:

```ts
interface ClearCartResponse {
  success: true;
  message: "Xóa toàn bộ giỏ hàng thành công";
}
```

---

# 8. Voucher & Xu

## 8.1 Lấy voucher và xu của user hiện tại

```http
GET /v1/api/voucher/my
```

- Auth: required
- Công dụng: lấy các voucher được gán cho user và số xu hiện tại.

Response `200`:

```ts
interface MyVouchersResponse {
  success: true;
  vouchers: Voucher[];
  xu: number;
}
```

---

# 9. Payment / Checkout

## 9.1 Tạo order COD hoặc URL thanh toán VNPay

```http
POST /v1/api/payment/create-qr
```

- Auth: required
- Công dụng: checkout các item được chọn trong cart, áp dụng voucher/xu, tạo order. Nếu `type = "cod"` thì tạo đơn COD; nếu không thì trả URL thanh toán VNPay.

Request body:

```ts
interface CreatePaymentRequest {
  items: ObjectId[];          // productId được chọn từ cart
  voucherCode?: string;
  usedXu?: number;
  deliveryAddressId: ObjectId;
  type?: "cod" | string;      // "cod" => COD, giá trị khác/undefined => VNPay
}
```

Response COD `201`:

```ts
interface CreateCodOrderResponse {
  success: true;
  orderId: ObjectId;
}
```

Response VNPay `201`:

```ts
interface CreateVnpayPaymentResponse {
  success: true;
  url: string;
}
```

Backend xử lý chính:
- Bắt buộc có `deliveryAddressId`.
- Lấy cart của user và chỉ checkout những productId trong `items`.
- Tính giá sau discount product.
- Trừ `usedXu` tối đa bằng số xu user có.
- Validate voucher: tồn tại, hiệu lực, min order, usage limit, quyền dùng voucher private, max usage per user.
- Tạo order `status = "pending"`, `statusOrder = "pending"`.
- Nếu COD: đổi `status = "cod"`, trừ stock, tăng sold, xóa item khỏi cart, tăng usedCount voucher, gửi email.
- Nếu VNPay: trả payment URL. Stock/cart/voucher được cập nhật ở callback khi thanh toán thành công.

Lỗi thường gặp:
- `400`: chưa chọn địa chỉ, cart trống, không có item được chọn, sản phẩm đã bị xóa, voucher không hợp lệ.

## 9.2 VNPay return callback

```http
GET /v1/api/payment/vnpay_return?...queryFromVNPay
```

- Auth: public
- Công dụng: callback/return URL từ VNPay, verify chữ ký và cập nhật order.
- FE thường không gọi API này trực tiếp; VNPay redirect về endpoint này, backend redirect tiếp về FE.

Redirect FE hiện tại:

```txt
http://localhost:3000/payment-callback?status=invalid
http://localhost:3000/payment-callback?status=notfound
http://localhost:3000/payment-callback?status=paid
http://localhost:3000/payment-callback?status=failed
http://localhost:3000/payment-callback?status=error
```

Status ý nghĩa:
- `invalid`: verify VNPay return URL fail.
- `notfound`: không tìm thấy order theo `vnp_TxnRef`.
- `paid`: thanh toán thành công; backend set `order.status = "paid"`, trừ stock, tăng sold, xóa item khỏi cart, tăng usedCount voucher, lưu `paymentInfo`.
- `failed`: thanh toán thất bại; backend xóa order.
- `error`: lỗi server khi xử lý callback.

---

# 10. Orders

## 10.1 Đếm số order của user hiện tại

```http
GET /v1/api/orders/count
```

- Auth: required
- Công dụng: đếm order của user đang đăng nhập.

Response `200`:

```ts
interface MyOrderCountResponse {
  success: true;
  message: string;
  data: { count: number };
}
```

## 10.2 Lấy danh sách order của user hiện tại

```http
GET /v1/api/orders?status=<OrderStatus>
```

- Auth: required
- Công dụng: lấy order của user đang đăng nhập, có thể lọc theo `statusOrder`.

Query params:

```ts
interface MyOrdersQuery {
  status?: OrderStatus;
}
```

Response `200`:

```ts
interface MyOrdersResponse {
  success: true;
  message: string;
  data: {
    orders: (Order & {
      items: (OrderItem & {
        product: Pick<Product, "_id" | "name" | "price" | "discount" | "images" | "slug">;
      })[];
      deliveryAddressId: Pick<DeliveryAddress, "_id" | "addressName" | "nameBuyer" | "phoneNumber" | "defaultAddress" | "note">;
    })[];
  };
}
```

Nếu không có order:

```ts
{
  success: true,
  message: "Không tìm thấy đơn hàng",
  data: { orders: [] }
}
```

## 10.3 User cập nhật trạng thái order

```http
PUT /v1/api/orders/:orderId/status
```

- Auth: required
- Công dụng: user hủy đơn hoặc xác nhận đã nhận hàng.

Request body:

```ts
interface UpdateMyOrderStatusRequest {
  statusOrder: OrderStatus; // backend đang dùng làm currentStatus để quyết định trạng thái mới
}
```

Logic chuyển trạng thái hiện tại:
- Gửi `statusOrder = "pending"` => backend đổi sang `cancelled`.
- Gửi `statusOrder = "delivering"` => backend đổi sang `delivered`.
- Giá trị khác => lỗi `Trạng thái không hợp lệ`.

Response `200`:

```ts
interface UpdateMyOrderStatusResponse {
  success: true;
  message: string;
  data: Order;
}
```

Backend side effects:
- Khi cancel: cộng lại stock; nếu payment `paid` thì hoàn `xu` cho user; notify admin nội bộ.
- Khi delivered: tăng `sold`, cộng xu/doanh thu cho admin, notify admin nội bộ.

## 10.4 Lấy order theo userId path

```http
GET /v1/api/orders/user/:userId
```

- Auth: required
- Công dụng: lấy toàn bộ order của userId truyền trên URL.
- Lưu ý: route protected nhưng không kiểm tra `userId` có trùng user đang đăng nhập hay không.

Response `200`:

```ts
interface OrdersByUserIdResponse {
  success: true;
  message: string;
  data: { orders: Order[] };
}
```

---

# 11. Admin - Stats

Tất cả admin API nằm sau `router.use(adminMiddleware)` nên cần `Authorization: Bearer <adminAccessToken>`. Theo code hiện tại, `adminMiddleware` kiểm tra `req.user.isAdmin` từ JWT payload đã decode.

## 11.1 Thống kê doanh thu

```http
GET /v1/api/admin/stats/revenue?from=2026-01-01&to=2026-06-03&groupBy=day
```

- Auth: admin
- Công dụng: thống kê doanh thu từ order có `statusOrder = "delivered"`.

Query params:

```ts
interface RevenueStatsQuery {
  from?: string;          // date string
  to?: string;            // date string
  groupBy?: "day" | "month"; // default day
}
```

Response `200`:

```ts
interface RevenueStatsResponse {
  success: true;
  data: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}
```

## 11.2 Thống kê user mới

```http
GET /v1/api/admin/stats/users?from=2026-01-01&to=2026-06-03&groupBy=day
```

- Auth: admin
- Công dụng: thống kê user mới theo ngày/tháng.

Response `200`:

```ts
interface NewUsersStatsResponse {
  success: true;
  data: {
    date: string;
    users: number;
  }[];
}
```

---

# 12. Admin - Orders

## 12.1 Lấy danh sách order cho admin

```http
GET /v1/api/admin/orders?status=<status>
```

- Auth: admin
- Công dụng: lấy danh sách order, lọc theo trạng thái cho dashboard admin.

Query params theo controller:

```ts
interface AdminOrdersQuery {
  status?: "pending" | "preparing" | "delivering" | "delivered" | "completed" | "cancelled";
}
```

Mapping đặc biệt trong controller:
- `status=delivering` => query `statusOrder=delivering`, `isDelivered=false`.
- `status=delivered` => query `statusOrder=delivering`, `isDelivered=true`.
- `status=completed` => query `statusOrder=delivered`.

Response `200`:

```ts
interface AdminOrdersResponse {
  success: true;
  message: string;
  data: { orders: Order[] };
}
```

## 12.2 Admin cập nhật trạng thái order

```http
PUT /v1/api/admin/orders/:orderId/status
```

- Auth: admin
- Công dụng: admin cập nhật trạng thái order.

Request body:

```ts
interface AdminUpdateOrderStatusRequest {
  newStatusOrder: OrderStatus;
}
```

Response `200`:

```ts
interface AdminUpdateOrderStatusResponse {
  success: true;
  message: string;
  data: Order;
}
```

Logic đáng chú ý:
- Nếu `newStatusOrder = "cancelled"` và order chưa cancel: hoàn xu nếu order đã paid, cộng lại stock.
- Nếu `newStatusOrder = "delivered"`: backend không set thẳng `statusOrder=delivered`; nó set `isDelivered=true`, `statusOrder="delivering"`, `autoUpdate = now + 3 phút` để chờ user xác nhận/tự động xác nhận.
- Các status khác set trực tiếp vào `statusOrder`.

---

# 13. Admin - Users

## 13.1 Lấy danh sách user

```http
GET /v1/api/admin/users?page=1&limit=5&keyword=<text>
```

- Auth: admin
- Công dụng: lấy danh sách user có phân trang và search.

Query params:

```ts
interface AdminUsersQuery {
  page?: number;    // default 1
  limit?: number;   // default 5, max 100
  keyword?: string; // search theo name/email trong service hiện tại
}
```

Response `200`:

```ts
interface AdminUsersResponse {
  success: true;
  message: string;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

Lưu ý: service search theo field `name` và `email`; model user có `fullName`, không có `name`, nên search theo tên có thể chưa đúng như mong đợi.

## 13.2 Bật/tắt active user

```http
PUT /v1/api/admin/users/:userId/active
```

- Auth: admin
- Công dụng: set `isActive` cho user.

Request body:

```ts
interface ToggleUserActiveRequest {
  isActive: boolean;
}
```

Response `200`:

```ts
interface ToggleUserActiveResponse {
  success: true;
  message: string;
  data: User;
}
```

## 13.3 Admin cập nhật user

```http
PUT /v1/api/admin/users/:userId/update
```

- Auth: admin
- Công dụng: admin cập nhật các field user được cho phép.

Request body:

```ts
interface AdminUpdateUserRequest {
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
}
```

Response `200`:

```ts
interface AdminUpdateUserResponse {
  success: true;
  message: "User profile updated successfully";
  data: User;
}
```

---

# 14. Admin - Products & Categories

## 14.1 Lấy danh sách product cho admin

```http
GET /v1/api/admin/products?page=1&limit=10&category=<idOrSlug>&keyword=<text>
```

- Auth: admin
- Công dụng: lấy product có phân trang, sort mới nhất trước, populate category/images.

Query params:

```ts
interface AdminProductsQuery {
  page?: number;     // default 1
  limit?: number;    // default 10
  category?: string; // theo code filter category/category.slug, nhưng category.slug trong filter có thể không hoạt động vì category là ObjectId
  keyword?: string;  // regex theo name
}
```

Response `200`:

```ts
interface AdminProductsResponse {
  success: true;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
  };
}
```

## 14.2 Tạo product

```http
POST /v1/api/admin/products
```

- Auth: admin
- Công dụng: tạo product và optional tạo ProductImage docs.

Request body:

```ts
interface AdminCreateProductRequest {
  name: string;
  description?: string;
  price: number;
  discount?: number;
  category: ObjectId;
  quantity?: number;
  images?: { url: string; alt?: string }[];
}
```

Response `200`:

```ts
interface AdminCreateProductResponse {
  success: true;
  message: "Thêm sản phẩm thành công";
  data: Product;
}
```

Lỗi thường gặp:
- `400`: thiếu `name` hoặc `price`, category không hợp lệ.

## 14.3 Cập nhật product

```http
PUT /v1/api/admin/products/:id
```

- Auth: admin
- Công dụng: cập nhật product; nếu gửi `images` array thì xóa ảnh cũ và tạo ảnh mới.

Request body:

```ts
interface AdminUpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  discount?: number;
  category?: ObjectId;
  quantity?: number;
  images?: { url: string; alt?: string }[];
}
```

Response `200`:

```ts
interface AdminUpdateProductResponse {
  success: true;
  message: "Cập nhật sản phẩm thành công";
  data: Product;
}
```

## 14.4 Xóa/ẩn product

```http
DELETE /v1/api/admin/products/:id
```

- Auth: admin
- Công dụng: soft delete product bằng `status = "deleted"`, đồng thời remove product khỏi tất cả cart.

Response `200`:

```ts
interface AdminDeleteProductResponse {
  success: true;
  message: "Đã xóa (ẩn) sản phẩm";
}
```

## 14.5 Tạo category cho admin

```http
POST /v1/api/admin/categories
```

- Auth: admin
- Công dụng: tạo category, tự sinh slug, check trùng name/slug.

Request body:

```ts
interface AdminCreateCategoryRequest {
  name: string;
  description?: string;
}
```

Response `201`:

```ts
interface AdminCreateCategoryResponse {
  success: true;
  message: "Thêm danh mục thành công";
  data: Category;
}
```

---

# 15. Full endpoint types cho FE copy nhanh

Phần này gom đầy đủ interface request/response/error cho từng endpoint. Các interface phía trên vẫn giữ để mô tả chi tiết từng feature; phần này dùng như type index khi implement client.

```ts
/** Common */
type AuthHeader = { Authorization: `Bearer ${string}` };

type CommonSuccessMessage = {
  success: true;
  message: string;
};

type CommonErrorResponse = {
  success: false;
  message: string;
  errors?: string[];
  error?: string;
};

type ServerMessageErrorResponse = {
  message: string;
};

type CategoryRawErrorResponse = {
  error: string;
};

/** 1. System */
interface GetRootRequest {}
interface GetRootResponse {
  message: "UTEShop API";
}
type GetRootErrorResponse = ServerMessageErrorResponse;

/** 2. Auth */
interface PostRegisterRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string;
  avt?: string;
}
interface PostRegisterResponse {
  success: true;
  message: string;
  data: User;
}
type PostRegisterErrorResponse = CommonErrorResponse;

interface PostLoginRequest {
  username: string;
  password: string;
}
interface PostLoginResponse {
  success: true;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}
type PostLoginErrorResponse = CommonErrorResponse;

interface PostVerifyOtpRequest {
  email: string;
  otp: string;
}
type PostVerifyOtpResponse = CommonSuccessMessage;
type PostVerifyOtpErrorResponse = CommonErrorResponse;

interface PostResendOtpRequest {
  email: string;
}
type PostResendOtpResponse = CommonSuccessMessage;
type PostResendOtpErrorResponse = CommonErrorResponse;

interface PostRefreshTokenRequest {
  refreshToken: string;
}
interface PostRefreshTokenResponse {
  success: true;
  message: string;
  data: { accessToken: string };
}
type PostRefreshTokenErrorResponse = CommonErrorResponse;

interface PostForgotPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}
type PostForgotPasswordResponse = CommonSuccessMessage;
type PostForgotPasswordErrorResponse = CommonErrorResponse;

/** 3. Product & Category */
interface GetTopViewedProductsRequest {}
type GetTopViewedProductsResponse = ProductListItem[];
type GetTopViewedProductsErrorResponse = ServerMessageErrorResponse;

interface GetTopDiscountProductsRequest {}
type GetTopDiscountProductsResponse = ProductListItem[];
type GetTopDiscountProductsErrorResponse = ServerMessageErrorResponse;

interface GetNewestProductsRequest {}
type GetNewestProductsResponse = ProductListItem[];
type GetNewestProductsErrorResponse = ServerMessageErrorResponse;

interface GetBestSellersRequest {
  query?: { limit?: number };
}
type GetBestSellersResponse = ProductListItem[];
type GetBestSellersErrorResponse = ServerMessageErrorResponse;

interface GetProductsRequest {
  query?: {
    page?: number;
    limit?: number;
    category?: string;
    keyword?: string;
  };
}
interface GetProductsResponse {
  success: true;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
  };
}
type GetProductsErrorResponse = CommonErrorResponse;

interface GetProductDetailRequest {
  params: { id: ObjectId };
}
interface GetProductDetailResponse {
  success: true;
  data: Product & {
    images: Pick<ProductImage, "url" | "alt">[];
    reviews: Pick<Review, "rating" | "comment" | "createdAt">[];
    avgRating: string | null;
  };
}
type GetProductDetailErrorResponse = CommonErrorResponse;

interface GetSimilarProductsRequest {
  params: { id: ObjectId };
}
type GetSimilarProductsResponse = ProductListItem[];
type GetSimilarProductsErrorResponse = ServerMessageErrorResponse;

interface PostCreateProductsRequest {
  body: Partial<Product> | Partial<Product>[];
}
type PostCreateProductsResponse =
  | { success: true; message: string; product: Product }
  | { success: true; message: string; products: Product[] };
type PostCreateProductsErrorResponse = CommonErrorResponse;

interface PostCategoriesRequest {
  body: { name: string; description?: string };
}
type PostCategoriesResponse = Category;
type PostCategoriesErrorResponse = CategoryRawErrorResponse;

interface GetCategoriesRequest {}
type GetCategoriesResponse = Pick<Category, "_id" | "name" | "description" | "slug">[];
type GetCategoriesErrorResponse = CategoryRawErrorResponse;

interface GetCategoryDetailRequest {
  params: { slug: string; id: ObjectId };
}
type GetCategoryDetailResponse = Category;
type GetCategoryDetailErrorResponse = CategoryRawErrorResponse;

/** 4. Review */
interface GetProductReviewsRequest {
  params: { productId: ObjectId };
}
interface GetProductReviewsResponse {
  success: true;
  count: number;
  data: (Review & {
    user: Pick<User, "_id" | "fullName" | "avt" | "email">;
  })[];
}
type GetProductReviewsErrorResponse = CommonErrorResponse;

interface GetMyReviewsRequest {
  headers: AuthHeader;
}
interface GetMyReviewsResponse {
  success: true;
  count: number;
  data: (Review & {
    product: Pick<Product, "_id" | "name" | "images">;
  })[];
}
type GetMyReviewsErrorResponse = CommonErrorResponse;

interface PostReviewRequest {
  headers: AuthHeader;
  body: {
    orderId: ObjectId;
    productId: ObjectId;
    rating: number;
    comment?: string;
  };
}
type ReviewRewardResponse =
  | {
      type: "voucher";
      code: string;
      discountValue: number;
      discountType: VoucherType;
      expiryDate: ISODateString;
    }
  | {
      type: "points";
      amount: number;
    };
interface PostReviewResponse {
  success: true;
  data: Review & { product?: Pick<Product, "name"> };
  reward: ReviewRewardResponse;
}
type PostReviewErrorResponse = CommonErrorResponse;

/** 5. User */
interface GetProfileRequest {
  headers: AuthHeader;
}
interface GetProfileResponse {
  success: true;
  data: User;
}
type GetProfileErrorResponse = CommonErrorResponse;

interface PutUpdateProfileRequest {
  headers: AuthHeader;
  body: {
    fullName?: string;
    phoneNumber?: string;
    gender?: boolean;
    dateOfBirth?: string;
    avt?: string;
  };
}
interface PutUpdateProfileResponse {
  success: true;
  message: "Profile updated successfully";
  data: User;
}
type PutUpdateProfileErrorResponse = CommonErrorResponse;

interface PostViewedProductsRequest {
  headers: AuthHeader;
  body: { productId: ObjectId };
}
interface PostViewedProductsResponse {
  success: true;
  message: "Added to viewed products successfully";
}
type PostViewedProductsErrorResponse = CommonErrorResponse;

interface PostFavoriteProductsRequest {
  headers: AuthHeader;
  body: { productId: ObjectId };
}
interface PostFavoriteProductsResponse {
  success: true;
  message: string;
  isFavorited: boolean;
}
type PostFavoriteProductsErrorResponse = CommonErrorResponse;

/** 6. Delivery Address */
interface GetDeliveryAddressesRequest {
  headers: AuthHeader;
}
interface GetDeliveryAddressesResponse {
  success: true;
  data: DeliveryAddress[];
}
type GetDeliveryAddressesErrorResponse = CommonErrorResponse;

interface PostDeliveryAddressRequest {
  headers: AuthHeader;
  body: {
    addressName: string;
    defaultAddress?: boolean;
    nameBuyer: string;
    phoneNumber?: string;
    note?: string;
  };
}
interface PostDeliveryAddressResponse {
  success: true;
  data: DeliveryAddress;
}
type PostDeliveryAddressErrorResponse = CommonErrorResponse;

interface PutDeliveryAddressRequest {
  headers: AuthHeader;
  params: { id: ObjectId };
  body: Partial<PostDeliveryAddressRequest["body"]>;
}
interface PutDeliveryAddressResponse {
  success: true;
  data: DeliveryAddress;
}
type PutDeliveryAddressErrorResponse = CommonErrorResponse;

interface PutDefaultDeliveryAddressRequest {
  headers: AuthHeader;
  params: { id: ObjectId };
}
interface PutDefaultDeliveryAddressResponse {
  success: true;
  data: DeliveryAddress;
}
type PutDefaultDeliveryAddressErrorResponse = CommonErrorResponse;

interface DeleteDeliveryAddressRequest {
  headers: AuthHeader;
  params: { id: ObjectId };
}
interface DeleteDeliveryAddressResponse {
  success: true;
  data: DeliveryAddress;
}
type DeleteDeliveryAddressErrorResponse = CommonErrorResponse;

/** 7. Cart */
interface GetCartRequest {
  headers: AuthHeader;
}
interface GetCartResponse {
  success: true;
  message: string;
  data: {
    items: (CartItem & {
      product: Pick<Product, "_id" | "name" | "price" | "discount" | "images">;
    })[];
    totalItems: number;
    totalPrice: number;
  };
}
type GetCartErrorResponse = CommonErrorResponse;

interface GetCartCountRequest {
  headers: AuthHeader;
}
interface GetCartCountResponse {
  success: true;
  message: string;
  data: { count: number };
}
type GetCartCountErrorResponse = CommonErrorResponse;

interface PostCartAddRequest {
  headers: AuthHeader;
  body: { productId: ObjectId; quantity?: number };
}
interface PostCartAddResponse {
  success: true;
  message: "Thêm vào giỏ hàng thành công";
  data: Cart;
}
type PostCartAddErrorResponse = CommonErrorResponse;

interface PutCartUpdateRequest {
  headers: AuthHeader;
  body: { productId: ObjectId; quantity: number };
}
interface PutCartUpdateResponse {
  success: true;
  message: "Cập nhật giỏ hàng thành công";
  data: {
    success: true;
    status: 200;
    message: "Cập nhật thành công";
    data: Cart;
  };
}
type PutCartUpdateErrorResponse = CommonErrorResponse;

interface DeleteCartRemoveRequest {
  headers: AuthHeader;
  params: { productId: ObjectId };
}
interface DeleteCartRemoveResponse {
  success: true;
  message: "Xóa sản phẩm khỏi giỏ hàng thành công";
  data: Cart;
}
type DeleteCartRemoveErrorResponse = CommonErrorResponse;

interface DeleteCartClearRequest {
  headers: AuthHeader;
}
interface DeleteCartClearResponse {
  success: true;
  message: "Xóa toàn bộ giỏ hàng thành công";
}
type DeleteCartClearErrorResponse = CommonErrorResponse;

/** 8. Voucher */
interface GetMyVoucherRequest {
  headers: AuthHeader;
}
interface GetMyVoucherResponse {
  success: true;
  vouchers: Voucher[];
  xu: number;
}
type GetMyVoucherErrorResponse = CommonErrorResponse;

/** 9. Payment */
interface PostPaymentCreateQrRequest {
  headers: AuthHeader;
  body: {
    items: ObjectId[];
    voucherCode?: string;
    usedXu?: number;
    deliveryAddressId: ObjectId;
    type?: "cod" | string;
  };
}
type PostPaymentCreateQrResponse =
  | { success: true; orderId: ObjectId }
  | { success: true; url: string };
type PostPaymentCreateQrErrorResponse = CommonErrorResponse;

interface GetVnpayReturnRequest {
  query: Record<string, string> & {
    vnp_TxnRef?: ObjectId;
    vnp_ResponseCode?: string;
  };
}
type GetVnpayReturnResponse = never; // backend redirect sang FE, không trả JSON
type GetVnpayReturnRedirectStatus = "invalid" | "notfound" | "paid" | "failed" | "error";
type GetVnpayReturnErrorResponse = never;

/** 10. Orders */
interface GetOrdersCountRequest {
  headers: AuthHeader;
}
interface GetOrdersCountResponse {
  success: true;
  message: string;
  data: { count: number };
}
type GetOrdersCountErrorResponse = CommonErrorResponse;

interface GetOrdersRequest {
  headers: AuthHeader;
  query?: { status?: OrderStatus };
}
interface GetOrdersResponse {
  success: true;
  message: string;
  data: {
    orders: (Order & {
      items: (OrderItem & {
        product: Pick<Product, "_id" | "name" | "price" | "discount" | "images" | "slug">;
      })[];
      deliveryAddressId: Pick<DeliveryAddress, "_id" | "addressName" | "nameBuyer" | "phoneNumber" | "defaultAddress" | "note">;
    })[];
  };
}
type GetOrdersErrorResponse = CommonErrorResponse;

interface PutOrderStatusRequest {
  headers: AuthHeader;
  params: { orderId: ObjectId };
  body: { statusOrder: OrderStatus };
}
interface PutOrderStatusResponse {
  success: true;
  message: string;
  data: Order;
}
type PutOrderStatusErrorResponse = CommonErrorResponse;

interface GetOrdersByUserIdRequest {
  headers: AuthHeader;
  params: { userId: ObjectId };
}
interface GetOrdersByUserIdResponse {
  success: true;
  message: string;
  data: { orders: Order[] };
}
type GetOrdersByUserIdErrorResponse = CommonErrorResponse;

/** 11. Admin Stats */
interface GetAdminRevenueStatsRequest {
  headers: AuthHeader;
  query?: { from?: string; to?: string; groupBy?: "day" | "month" };
}
interface GetAdminRevenueStatsResponse {
  success: true;
  data: { date: string; revenue: number; orders: number }[];
}
type GetAdminRevenueStatsErrorResponse = CommonErrorResponse;

interface GetAdminUsersStatsRequest {
  headers: AuthHeader;
  query?: { from?: string; to?: string; groupBy?: "day" | "month" };
}
interface GetAdminUsersStatsResponse {
  success: true;
  data: { date: string; users: number }[];
}
type GetAdminUsersStatsErrorResponse = CommonErrorResponse;

/** 12. Admin Orders */
interface GetAdminOrdersRequest {
  headers: AuthHeader;
  query?: { status?: "pending" | "preparing" | "delivering" | "delivered" | "completed" | "cancelled" };
}
interface GetAdminOrdersResponse {
  success: true;
  message: string;
  data: { orders: Order[] };
}
type GetAdminOrdersErrorResponse = CommonErrorResponse;

interface PutAdminOrderStatusRequest {
  headers: AuthHeader;
  params: { orderId: ObjectId };
  body: { newStatusOrder: OrderStatus };
}
interface PutAdminOrderStatusResponse {
  success: true;
  message: string;
  data: Order;
}
type PutAdminOrderStatusErrorResponse = CommonErrorResponse;

/** 13. Admin Users */
interface GetAdminUsersRequest {
  headers: AuthHeader;
  query?: { page?: number; limit?: number; keyword?: string };
}
interface GetAdminUsersResponse {
  success: true;
  message: string;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
type GetAdminUsersErrorResponse = CommonErrorResponse;

interface PutAdminUserActiveRequest {
  headers: AuthHeader;
  params: { userId: ObjectId };
  body: { isActive: boolean };
}
interface PutAdminUserActiveResponse {
  success: true;
  message: string;
  data: User;
}
type PutAdminUserActiveErrorResponse = CommonErrorResponse;

interface PutAdminUserUpdateRequest {
  headers: AuthHeader;
  params: { userId: ObjectId };
  body: {
    fullName?: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
    isActive?: boolean;
  };
}
interface PutAdminUserUpdateResponse {
  success: true;
  message: "User profile updated successfully";
  data: User;
}
type PutAdminUserUpdateErrorResponse = CommonErrorResponse;

/** 14. Admin Products & Categories */
interface GetAdminProductsRequest {
  headers: AuthHeader;
  query?: { page?: number; limit?: number; category?: string; keyword?: string };
}
interface GetAdminProductsResponse {
  success: true;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
  };
}
type GetAdminProductsErrorResponse = CommonErrorResponse;

interface PostAdminProductRequest {
  headers: AuthHeader;
  body: {
    name: string;
    description?: string;
    price: number;
    discount?: number;
    category: ObjectId;
    quantity?: number;
    images?: { url: string; alt?: string }[];
  };
}
interface PostAdminProductResponse {
  success: true;
  message: "Thêm sản phẩm thành công";
  data: Product;
}
type PostAdminProductErrorResponse = CommonErrorResponse;

interface PutAdminProductRequest {
  headers: AuthHeader;
  params: { id: ObjectId };
  body: {
    name?: string;
    description?: string;
    price?: number;
    discount?: number;
    category?: ObjectId;
    quantity?: number;
    images?: { url: string; alt?: string }[];
  };
}
interface PutAdminProductResponse {
  success: true;
  message: "Cập nhật sản phẩm thành công";
  data: Product;
}
type PutAdminProductErrorResponse = CommonErrorResponse;

interface DeleteAdminProductRequest {
  headers: AuthHeader;
  params: { id: ObjectId };
}
interface DeleteAdminProductResponse {
  success: true;
  message: "Đã xóa (ẩn) sản phẩm";
}
type DeleteAdminProductErrorResponse = CommonErrorResponse;

interface PostAdminCategoryRequest {
  headers: AuthHeader;
  body: { name: string; description?: string };
}
interface PostAdminCategoryResponse {
  success: true;
  message: "Thêm danh mục thành công";
  data: Category;
}
type PostAdminCategoryErrorResponse = CommonErrorResponse;
```

## Endpoint map type

Có thể dùng map này để ràng buộc type trong API client FE:

```ts
interface ClientApiTypeMap {
  "GET /v1/api/": {
    request: GetRootRequest;
    response: GetRootResponse;
    error: GetRootErrorResponse;
  };

  "POST /v1/api/register": {
    request: PostRegisterRequest;
    response: PostRegisterResponse;
    error: PostRegisterErrorResponse;
  };
  "POST /v1/api/login": {
    request: PostLoginRequest;
    response: PostLoginResponse;
    error: PostLoginErrorResponse;
  };
  "POST /v1/api/verify-otp": {
    request: PostVerifyOtpRequest;
    response: PostVerifyOtpResponse;
    error: PostVerifyOtpErrorResponse;
  };
  "POST /v1/api/resend-otp": {
    request: PostResendOtpRequest;
    response: PostResendOtpResponse;
    error: PostResendOtpErrorResponse;
  };
  "POST /v1/api/refresh-token": {
    request: PostRefreshTokenRequest;
    response: PostRefreshTokenResponse;
    error: PostRefreshTokenErrorResponse;
  };
  "POST /v1/api/forgot-password": {
    request: PostForgotPasswordRequest;
    response: PostForgotPasswordResponse;
    error: PostForgotPasswordErrorResponse;
  };

  "GET /v1/api/products/top-viewed": {
    request: GetTopViewedProductsRequest;
    response: GetTopViewedProductsResponse;
    error: GetTopViewedProductsErrorResponse;
  };
  "GET /v1/api/products/top-discount": {
    request: GetTopDiscountProductsRequest;
    response: GetTopDiscountProductsResponse;
    error: GetTopDiscountProductsErrorResponse;
  };
  "GET /v1/api/newest": {
    request: GetNewestProductsRequest;
    response: GetNewestProductsResponse;
    error: GetNewestProductsErrorResponse;
  };
  "GET /v1/api/best-sellers": {
    request: GetBestSellersRequest;
    response: GetBestSellersResponse;
    error: GetBestSellersErrorResponse;
  };
  "GET /v1/api/products": {
    request: GetProductsRequest;
    response: GetProductsResponse;
    error: GetProductsErrorResponse;
  };
  "GET /v1/api/products/:id": {
    request: GetProductDetailRequest;
    response: GetProductDetailResponse;
    error: GetProductDetailErrorResponse;
  };
  "GET /v1/api/products/:id/similar": {
    request: GetSimilarProductsRequest;
    response: GetSimilarProductsResponse;
    error: GetSimilarProductsErrorResponse;
  };
  "POST /v1/api/create-products": {
    request: PostCreateProductsRequest;
    response: PostCreateProductsResponse;
    error: PostCreateProductsErrorResponse;
  };
  "POST /v1/api/categories": {
    request: PostCategoriesRequest;
    response: PostCategoriesResponse;
    error: PostCategoriesErrorResponse;
  };
  "GET /v1/api/categories": {
    request: GetCategoriesRequest;
    response: GetCategoriesResponse;
    error: GetCategoriesErrorResponse;
  };
  "GET /v1/api/categories/:slug-:id": {
    request: GetCategoryDetailRequest;
    response: GetCategoryDetailResponse;
    error: GetCategoryDetailErrorResponse;
  };

  "GET /v1/api/products/:productId/reviews": {
    request: GetProductReviewsRequest;
    response: GetProductReviewsResponse;
    error: GetProductReviewsErrorResponse;
  };
  "GET /v1/api/reviews": {
    request: GetMyReviewsRequest;
    response: GetMyReviewsResponse;
    error: GetMyReviewsErrorResponse;
  };
  "POST /v1/api/reviews": {
    request: PostReviewRequest;
    response: PostReviewResponse;
    error: PostReviewErrorResponse;
  };

  "GET /v1/api/profile": {
    request: GetProfileRequest;
    response: GetProfileResponse;
    error: GetProfileErrorResponse;
  };
  "PUT /v1/api/update-profile": {
    request: PutUpdateProfileRequest;
    response: PutUpdateProfileResponse;
    error: PutUpdateProfileErrorResponse;
  };
  "POST /v1/api/user/viewed-products": {
    request: PostViewedProductsRequest;
    response: PostViewedProductsResponse;
    error: PostViewedProductsErrorResponse;
  };
  "POST /v1/api/user/favorite-products": {
    request: PostFavoriteProductsRequest;
    response: PostFavoriteProductsResponse;
    error: PostFavoriteProductsErrorResponse;
  };

  "GET /v1/api/user/delivery-addresses": {
    request: GetDeliveryAddressesRequest;
    response: GetDeliveryAddressesResponse;
    error: GetDeliveryAddressesErrorResponse;
  };
  "POST /v1/api/user/delivery-addresses": {
    request: PostDeliveryAddressRequest;
    response: PostDeliveryAddressResponse;
    error: PostDeliveryAddressErrorResponse;
  };
  "PUT /v1/api/user/delivery-addresses/:id": {
    request: PutDeliveryAddressRequest;
    response: PutDeliveryAddressResponse;
    error: PutDeliveryAddressErrorResponse;
  };
  "PUT /v1/api/user/delivery-addresses/:id/default": {
    request: PutDefaultDeliveryAddressRequest;
    response: PutDefaultDeliveryAddressResponse;
    error: PutDefaultDeliveryAddressErrorResponse;
  };
  "DELETE /v1/api/user/delivery-addresses/:id": {
    request: DeleteDeliveryAddressRequest;
    response: DeleteDeliveryAddressResponse;
    error: DeleteDeliveryAddressErrorResponse;
  };

  "GET /v1/api/cart": {
    request: GetCartRequest;
    response: GetCartResponse;
    error: GetCartErrorResponse;
  };
  "GET /v1/api/cart/count": {
    request: GetCartCountRequest;
    response: GetCartCountResponse;
    error: GetCartCountErrorResponse;
  };
  "POST /v1/api/cart/add": {
    request: PostCartAddRequest;
    response: PostCartAddResponse;
    error: PostCartAddErrorResponse;
  };
  "PUT /v1/api/cart/update": {
    request: PutCartUpdateRequest;
    response: PutCartUpdateResponse;
    error: PutCartUpdateErrorResponse;
  };
  "DELETE /v1/api/cart/remove/:productId": {
    request: DeleteCartRemoveRequest;
    response: DeleteCartRemoveResponse;
    error: DeleteCartRemoveErrorResponse;
  };
  "DELETE /v1/api/cart/clear": {
    request: DeleteCartClearRequest;
    response: DeleteCartClearResponse;
    error: DeleteCartClearErrorResponse;
  };

  "GET /v1/api/voucher/my": {
    request: GetMyVoucherRequest;
    response: GetMyVoucherResponse;
    error: GetMyVoucherErrorResponse;
  };

  "POST /v1/api/payment/create-qr": {
    request: PostPaymentCreateQrRequest;
    response: PostPaymentCreateQrResponse;
    error: PostPaymentCreateQrErrorResponse;
  };
  "GET /v1/api/payment/vnpay_return": {
    request: GetVnpayReturnRequest;
    response: GetVnpayReturnResponse;
    error: GetVnpayReturnErrorResponse;
  };

  "GET /v1/api/orders/count": {
    request: GetOrdersCountRequest;
    response: GetOrdersCountResponse;
    error: GetOrdersCountErrorResponse;
  };
  "GET /v1/api/orders": {
    request: GetOrdersRequest;
    response: GetOrdersResponse;
    error: GetOrdersErrorResponse;
  };
  "PUT /v1/api/orders/:orderId/status": {
    request: PutOrderStatusRequest;
    response: PutOrderStatusResponse;
    error: PutOrderStatusErrorResponse;
  };
  "GET /v1/api/orders/user/:userId": {
    request: GetOrdersByUserIdRequest;
    response: GetOrdersByUserIdResponse;
    error: GetOrdersByUserIdErrorResponse;
  };

  "GET /v1/api/admin/stats/revenue": {
    request: GetAdminRevenueStatsRequest;
    response: GetAdminRevenueStatsResponse;
    error: GetAdminRevenueStatsErrorResponse;
  };
  "GET /v1/api/admin/stats/users": {
    request: GetAdminUsersStatsRequest;
    response: GetAdminUsersStatsResponse;
    error: GetAdminUsersStatsErrorResponse;
  };
  "GET /v1/api/admin/orders": {
    request: GetAdminOrdersRequest;
    response: GetAdminOrdersResponse;
    error: GetAdminOrdersErrorResponse;
  };
  "PUT /v1/api/admin/orders/:orderId/status": {
    request: PutAdminOrderStatusRequest;
    response: PutAdminOrderStatusResponse;
    error: PutAdminOrderStatusErrorResponse;
  };
  "GET /v1/api/admin/users": {
    request: GetAdminUsersRequest;
    response: GetAdminUsersResponse;
    error: GetAdminUsersErrorResponse;
  };
  "PUT /v1/api/admin/users/:userId/active": {
    request: PutAdminUserActiveRequest;
    response: PutAdminUserActiveResponse;
    error: PutAdminUserActiveErrorResponse;
  };
  "PUT /v1/api/admin/users/:userId/update": {
    request: PutAdminUserUpdateRequest;
    response: PutAdminUserUpdateResponse;
    error: PutAdminUserUpdateErrorResponse;
  };
  "GET /v1/api/admin/products": {
    request: GetAdminProductsRequest;
    response: GetAdminProductsResponse;
    error: GetAdminProductsErrorResponse;
  };
  "POST /v1/api/admin/products": {
    request: PostAdminProductRequest;
    response: PostAdminProductResponse;
    error: PostAdminProductErrorResponse;
  };
  "PUT /v1/api/admin/products/:id": {
    request: PutAdminProductRequest;
    response: PutAdminProductResponse;
    error: PutAdminProductErrorResponse;
  };
  "DELETE /v1/api/admin/products/:id": {
    request: DeleteAdminProductRequest;
    response: DeleteAdminProductResponse;
    error: DeleteAdminProductErrorResponse;
  };
  "POST /v1/api/admin/categories": {
    request: PostAdminCategoryRequest;
    response: PostAdminCategoryResponse;
    error: PostAdminCategoryErrorResponse;
  };
}
```

---

# 16. Ghi chú quan trọng cho FE

1. Các endpoint notification đã cố ý không liệt kê trong tài liệu này.
2. Một số route public hiện tại có vẻ nên là admin theo nghiệp vụ:
   - `POST /v1/api/create-products`
   - `POST /v1/api/categories`
3. `PUT /v1/api/cart/update` đang cộng thêm quantity, không set quantity tuyệt đối.
4. `PUT /v1/api/orders/:orderId/status` nhận `statusOrder` như trạng thái hiện tại để backend tự suy ra trạng thái mới, không phải truyền trực tiếp trạng thái đích.
5. `GET /v1/api/orders/user/:userId` chỉ cần auth nhưng lấy theo path userId bất kỳ.
6. VNPay callback redirect cứng về `http://localhost:3000/payment-callback` theo code hiện tại.
7. Admin token cần có `isAdmin: true` trong access token payload.
