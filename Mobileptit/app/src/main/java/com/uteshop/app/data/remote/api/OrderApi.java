package com.uteshop.app.data.remote.api;

import com.uteshop.app.data.remote.dto.request.*;
import com.uteshop.app.data.remote.dto.response.*;
import retrofit2.Call;
import retrofit2.http.*;

public interface OrderApi {
    @GET("v1/api/orders/count")
    Call<OrderCountResponse> getOrderCount();

    @GET("v1/api/orders")
    Call<OrderListResponse> getOrders(@Query("status") String status);

    @PUT("v1/api/orders/{orderId}/status")
    Call<OrderUpdateResponse> updateOrderStatus(@Path("orderId") String id, @Body UpdateOrderStatusRequest r);

    @GET("v1/api/orders/user/{userId}")
    Call<OrderListResponse> getOrdersByUserId(@Path("userId") String userId);
}
