package com.uteshop.app.data.remote.api;

import com.uteshop.app.data.remote.dto.request.CreatePaymentRequest;
import com.uteshop.app.data.remote.dto.response.CreatePaymentResponse;
import retrofit2.Call;
import retrofit2.http.*;

public interface PaymentApi {
    @POST("v1/api/payment/create-qr")
    Call<CreatePaymentResponse> createPayment(@Body CreatePaymentRequest r);
}
