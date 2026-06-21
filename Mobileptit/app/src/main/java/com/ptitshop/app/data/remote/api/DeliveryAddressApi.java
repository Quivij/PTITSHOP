package com.ptitshop.app.data.remote.api;

import com.ptitshop.app.data.remote.dto.request.DeliveryAddressRequest;
import com.ptitshop.app.data.remote.dto.response.*;
import retrofit2.Call;
import retrofit2.http.*;

public interface DeliveryAddressApi {
    @GET("v1/api/user/delivery-addresses")
    Call<DeliveryAddressListResponse> getAddresses();

    @POST("v1/api/user/delivery-addresses")
    Call<DeliveryAddressResponse> createAddress(@Body DeliveryAddressRequest r);

    @PUT("v1/api/user/delivery-addresses/{id}")
    Call<DeliveryAddressResponse> updateAddress(@Path("id") String id, @Body DeliveryAddressRequest r);

    @PUT("v1/api/user/delivery-addresses/{id}/default")
    Call<DeliveryAddressResponse> setDefault(@Path("id") String id);

    @DELETE("v1/api/user/delivery-addresses/{id}")
    Call<DeliveryAddressResponse> deleteAddress(@Path("id") String id);
}
