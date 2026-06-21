package com.ptitshop.app.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.core.constants.AppConstants;
import com.ptitshop.app.core.utils.ToastUtils;
import com.ptitshop.app.data.remote.dto.request.ResendOtpRequest;
import com.ptitshop.app.data.remote.dto.request.VerifyOtpRequest;
import com.ptitshop.app.data.remote.dto.response.SimpleResponse;
import com.ptitshop.app.repository.AuthRepository;
import com.ptitshop.app.repository.RepositoryCallback;

public class VerifyOtpActivity extends BaseActivity {
    private EditText email, otp;
    private Button btnVerify, btnResend;
    private TextView tvError, tvSuccess;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_verify_otp);

        email = findViewById(R.id.edtEmail);
        otp = findViewById(R.id.edtOtp);
        btnVerify = findViewById(R.id.btnVerify);
        btnResend = findViewById(R.id.btnResend);
        tvError = findViewById(R.id.tvError);
        tvSuccess = findViewById(R.id.tvSuccess);

        email.setText(getIntent().getStringExtra(AppConstants.EXTRA_EMAIL));

        AuthRepository repo = new AuthRepository(this);

        btnVerify.setOnClickListener(v -> {
            clearMessages();
            String otpCode = otp.getText().toString().trim();
            if (otpCode.length() != 6) {
                showError("Please enter a 6-digit OTP");
                return;
            }
            btnVerify.setEnabled(false);
            btnVerify.setText("Verifying...");
            repo.verifyOtp(
                new VerifyOtpRequest(email.getText().toString().trim(), otpCode),
                new RepositoryCallback<SimpleResponse>() {
                    public void onSuccess(SimpleResponse d) {
                        tvSuccess.setText("OTP verified successfully! Redirecting to login...");
                        tvSuccess.setVisibility(TextView.VISIBLE);
                        btnVerify.setEnabled(false);
                        btnVerify.setText("Verify");
                        new android.os.Handler().postDelayed(() -> {
                            startActivity(new Intent(VerifyOtpActivity.this, LoginActivity.class));
                            finish();
                        }, 1500);
                    }
                    public void onError(String m) {
                        btnVerify.setEnabled(true);
                        btnVerify.setText("Verify");
                        showError(m);
                    }
                }
            );
        });

        btnResend.setOnClickListener(v -> {
            clearMessages();
            btnResend.setEnabled(false);
            btnResend.setText("Sending...");
            repo.resendOtp(
                new ResendOtpRequest(email.getText().toString().trim()),
                new RepositoryCallback<SimpleResponse>() {
                    public void onSuccess(SimpleResponse d) {
                        ToastUtils.show(VerifyOtpActivity.this, d.message);
                        otp.setText("");
                        btnResend.setEnabled(true);
                        btnResend.setText("Resend OTP");
                    }
                    public void onError(String m) {
                        btnResend.setEnabled(true);
                        btnResend.setText("Resend OTP");
                        showError(m);
                    }
                }
            );
        });
    }

    private void showError(String msg) {
        tvError.setText(msg);
        tvError.setVisibility(TextView.VISIBLE);
    }

    private void clearMessages() {
        tvError.setVisibility(TextView.GONE);
        tvSuccess.setVisibility(TextView.GONE);
    }
}
