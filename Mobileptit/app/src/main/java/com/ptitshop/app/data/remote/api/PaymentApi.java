package com.ptitshop.app.data.remote.api;

import com.ptitshop.app.data.remote.dto.request.CreatePaymentRequest;
import com.ptitshop.app.data.remote.dto.response.CreatePaymentResponse;
import retrofit2.Call;
import retrofit2.http.*;

public interface PaymentApi {
    @POST("v1/api/payment/create-qr")
    Call<CreatePaymentResponse> createPayment(@Body CreatePaymentRequest r);
}
