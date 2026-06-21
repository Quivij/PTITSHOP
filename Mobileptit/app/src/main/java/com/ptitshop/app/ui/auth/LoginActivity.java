package com.ptitshop.app.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.core.utils.ToastUtils;
import com.ptitshop.app.data.remote.dto.request.LoginRequest;
import com.ptitshop.app.data.remote.dto.response.LoginResponse;
import com.ptitshop.app.repository.*;
import com.ptitshop.app.ui.main.MainActivity;

public class LoginActivity extends BaseActivity {
    private EditText username, password;
    private CheckBox remember;
    private Button btnLogin;
    private TextView tvError;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_login);

        username = findViewById(R.id.edtUsername);
        password = findViewById(R.id.edtPassword);
        remember = findViewById(R.id.chkRemember);
        btnLogin = findViewById(R.id.btnLogin);
        tvError = findViewById(R.id.tvError);

        AuthRepository repo = new AuthRepository(this);

        btnLogin.setOnClickListener(v -> {
            tvError.setVisibility(TextView.GONE);
            btnLogin.setEnabled(false);
            btnLogin.setText("Logging in...");

            repo.login(
                new LoginRequest(username.getText().toString().trim(), password.getText().toString()),
                new RepositoryCallback<LoginResponse>() {
                    public void onSuccess(LoginResponse d) {
                        if (remember.isChecked()) {
                            // Persist token for remember me
                            session().saveLoginSession(d.data.user, d.data.accessToken, d.data.refreshToken);
                        }
                        startActivity(new Intent(LoginActivity.this, MainActivity.class));
                        finish();
                    }
                    public void onError(String m) {
                        btnLogin.setEnabled(true);
                        btnLogin.setText("Log in");
                        tvError.setText(m);
                        tvError.setVisibility(TextView.VISIBLE);
                    }
                }
            );
        });

        Button btnRegister = findViewById(R.id.btnRegister);
        btnRegister.setOnClickListener(v -> startActivity(new Intent(this, RegisterActivity.class)));

        TextView forgot = findViewById(R.id.tvForgotPassword);
        forgot.setOnClickListener(v -> startActivity(new Intent(this, ForgotPasswordActivity.class)));
    }
}
