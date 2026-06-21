package com.uteshop.app.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;
import com.uteshop.app.R;
import com.uteshop.app.core.base.BaseActivity;
import com.uteshop.app.core.utils.ToastUtils;
import com.uteshop.app.data.remote.dto.request.ForgotPasswordRequest;
import com.uteshop.app.data.remote.dto.response.SimpleResponse;
import com.uteshop.app.repository.AuthRepository;
import com.uteshop.app.repository.RepositoryCallback;

public class ForgotPasswordActivity extends BaseActivity {
    private EditText email, otp, newPassword, confirmPassword;
    private Button btnSendOtp, btnSubmit;
    private TextView tvError, tvSuccess;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_forgot_password);

        email = findViewById(R.id.edtEmail);
        otp = findViewById(R.id.edtOtp);
        newPassword = findViewById(R.id.edtNewPassword);
        confirmPassword = findViewById(R.id.edtConfirmPassword);
        btnSendOtp = findViewById(R.id.btnSendOtp);
        btnSubmit = findViewById(R.id.btnSubmit);
        tvError = findViewById(R.id.tvError);
        tvSuccess = findViewById(R.id.tvSuccess);

        AuthRepository repo = new AuthRepository(this);

        // Send OTP
        btnSendOtp.setOnClickListener(v -> {
            clearMessages();
            String e = email.getText().toString().trim();
            if (e.isEmpty()) {
                showError("Please enter your email before requesting OTP.");
                return;
            }
            btnSendOtp.setEnabled(false);
            btnSendOtp.setText("Sending...");
            repo.resendOtp(
                new com.uteshop.app.data.remote.dto.request.ResendOtpRequest(e),
                new RepositoryCallback<SimpleResponse>() {
                    public void onSuccess(SimpleResponse d) {
                        ToastUtils.show(ForgotPasswordActivity.this, "OTP sent to your email!");
                        tvSuccess.setText("OTP sent to your email!");
                        tvSuccess.setVisibility(TextView.VISIBLE);
                        btnSendOtp.setEnabled(true);
                        btnSendOtp.setText("Send OTP");
                    }
                    public void onError(String m) {
                        btnSendOtp.setEnabled(true);
                        btnSendOtp.setText("Send OTP");
                        showError(m);
                    }
                }
            );
        });

        // Submit
        btnSubmit.setOnClickListener(v -> {
            clearMessages();

            String e = email.getText().toString().trim();
            String o = otp.getText().toString().trim();
            String p = newPassword.getText().toString();
            String cp = confirmPassword.getText().toString();

            if (p.length() < 6) {
                showError("Password must be at least 6 characters");
                return;
            }
            if (!p.equals(cp)) {
                showError("Passwords do not match");
                return;
            }

            btnSubmit.setEnabled(false);
            btnSubmit.setText("Resetting...");

            ForgotPasswordRequest r = new ForgotPasswordRequest();
            r.email = e;
            r.otp = o;
            r.newPassword = p;

            repo.forgotPassword(r, new RepositoryCallback<SimpleResponse>() {
                public void onSuccess(SimpleResponse d) {
                    tvSuccess.setText("Password reset successfully! Redirecting to login...");
                    tvSuccess.setVisibility(TextView.VISIBLE);
                    btnSubmit.setEnabled(false);
                    btnSubmit.setText("Reset Password");
                    new android.os.Handler().postDelayed(() -> {
                        startActivity(new Intent(ForgotPasswordActivity.this, LoginActivity.class));
                        finish();
                    }, 2000);
                }
                public void onError(String m) {
                    btnSubmit.setEnabled(true);
                    btnSubmit.setText("Reset Password");
                    showError(m);
                }
            });
        });

        // Back to login
        findViewById(R.id.tvBackToLogin).setOnClickListener(v -> {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
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
