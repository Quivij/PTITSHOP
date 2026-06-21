package com.uteshop.app.data.remote.api;

import com.uteshop.app.data.remote.dto.request.*;
import com.uteshop.app.data.remote.dto.response.*;
import retrofit2.Call;
import retrofit2.http.*;

public interface AdminApi {
    @GET("v1/api/admin/stats/revenue")
    Call<RevenueStatsResponse> getRevenueStats(@Query("from") String from, @Query("to") String to, @Query("groupBy") String groupBy);

    @GET("v1/api/admin/stats/users")
    Call<UserStatsResponse> getUserStats(@Query("from") String from, @Query("to") String to, @Query("groupBy") String groupBy);

    @GET("v1/api/admin/orders")
    Call<OrderListResponse> getAdminOrders(@Query("status") String status);

    @PUT("v1/api/admin/orders/{orderId}/status")
    Call<OrderUpdateResponse> updateAdminOrderStatus(@Path("orderId") String id, @Body AdminUpdateOrderStatusRequest r);

    @GET("v1/api/admin/users")
    Call<AdminUserListResponse> getUsers(@Query("page") int p, @Query("limit") int l, @Query("keyword") String k);

    @PUT("v1/api/admin/users/{userId}/active")
    Call<ProfileResponse> toggleUserActive(@Path("userId") String id, @Body ToggleUserActiveRequest r);

    @GET("v1/api/admin/products")
    Call<ProductListResponse> getAdminProducts(@Query("page") int p, @Query("limit") int l, @Query("category") String c, @Query("keyword") String k);

    @POST("v1/api/admin/products")
    Call<ProductMutationResponse> createProduct(@Body ProductMutationRequest r);

    @PUT("v1/api/admin/products/{id}")
    Call<ProductMutationResponse> updateProduct(@Path("id") String id, @Body ProductMutationRequest r);

    @DELETE("v1/api/admin/products/{id}")
    Call<SimpleResponse> deleteProduct(@Path("id") String id);

    @POST("v1/api/admin/categories")
    Call<CategoryMutationResponse> createCategory(@Body CategoryMutationRequest r);
}
