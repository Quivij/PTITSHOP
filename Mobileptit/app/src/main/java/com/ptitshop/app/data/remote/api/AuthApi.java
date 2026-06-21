package com.ptitshop.app.data.remote.api;

import com.ptitshop.app.data.remote.dto.request.*;
import com.ptitshop.app.data.remote.dto.response.*;
import retrofit2.Call;
import retrofit2.http.*;

public interface AuthApi {
    @POST("v1/api/login")
    Call<LoginResponse> login(@Body LoginRequest r);

    @POST("v1/api/register")
    Call<RegisterResponse> register(@Body RegisterRequest r);

    @POST("v1/api/verify-otp")
    Call<SimpleResponse> verifyOtp(@Body VerifyOtpRequest r);

    @POST("v1/api/resend-otp")
    Call<SimpleResponse> resendOtp(@Body ResendOtpRequest r);

    @POST("v1/api/refresh-token")
    Call<RefreshTokenResponse> refreshToken(@Body RefreshTokenRequest r);

    @POST("v1/api/forgot-password")
    Call<SimpleResponse> forgotPassword(@Body ForgotPasswordRequest r);
}
