package com.uteshop.app.data.remote.api;

import com.uteshop.app.data.remote.dto.request.*;
import com.uteshop.app.data.remote.dto.response.*;
import retrofit2.Call;
import retrofit2.http.*;

public interface CartApi {
    @GET("v1/api/cart")
    Call<CartResponse> getCart();

    @GET("v1/api/cart/count")
    Call<CartCountResponse> getCartCount();

    @POST("v1/api/cart/add")
    Call<CartMutationResponse> addToCart(@Body AddToCartRequest r);

    @PUT("v1/api/cart/update")
    Call<CartUpdateResponse> updateCartItem(@Body UpdateCartItemRequest r);

    @DELETE("v1/api/cart/remove/{productId}")
    Call<CartMutationResponse> removeFromCart(@Path("productId") String productId);

    @DELETE("v1/api/cart/clear")
    Call<SimpleResponse> clearCart();
}
