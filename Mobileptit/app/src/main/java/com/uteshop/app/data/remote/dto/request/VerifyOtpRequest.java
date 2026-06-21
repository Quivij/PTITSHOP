package com.uteshop.app.data.remote.dto.request;

public class VerifyOtpRequest {
    public String email, otp;
    public VerifyOtpRequest(String email, String otp) {
        this.email=email;
        this.otp=otp;
    }
}
