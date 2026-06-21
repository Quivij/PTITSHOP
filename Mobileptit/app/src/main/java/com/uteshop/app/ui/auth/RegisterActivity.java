package com.uteshop.app.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.widget.*;
import com.uteshop.app.R;
import com.uteshop.app.core.base.BaseActivity;
import com.uteshop.app.core.constants.AppConstants;
import com.uteshop.app.core.utils.ToastUtils;
import com.uteshop.app.data.remote.dto.request.RegisterRequest;
import com.uteshop.app.data.remote.dto.response.RegisterResponse;
import com.uteshop.app.repository.AuthRepository;
import com.uteshop.app.repository.RepositoryCallback;

public class RegisterActivity extends BaseActivity {
    private EditText fullName, username, email, phone, password, confirmPassword, dateOfBirth;
    private RadioGroup genderGroup;
    private Button btnRegister;
    private TextView tvError;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_register);

        fullName = findViewById(R.id.edtFullName);
        username = findViewById(R.id.edtUsername);
        email = findViewById(R.id.edtEmail);
        phone = findViewById(R.id.edtPhone);
        password = findViewById(R.id.edtPassword);
        confirmPassword = findViewById(R.id.edtConfirmPassword);
        dateOfBirth = findViewById(R.id.edtDateOfBirth);
        genderGroup = findViewById(R.id.rgGender);
        btnRegister = findViewById(R.id.btnRegister);
        tvError = findViewById(R.id.tvError);

        // Date picker for dateOfBirth
        dateOfBirth.setFocusable(false);
        dateOfBirth.setOnClickListener(v -> {
            android.app.DatePickerDialog dialog = new android.app.DatePickerDialog(this,
                (view, year, month, day) -> dateOfBirth.setText(year + "-" + pad(month + 1) + "-" + pad(day)),
                2000, 0, 1);
            dialog.show();
        });

        btnRegister.setOnClickListener(v -> handleRegister());
    }

    private String pad(int n) { return n < 10 ? "0" + n : String.valueOf(n); }

    private void handleRegister() {
        tvError.setVisibility(TextView.GONE);

        String f = fullName.getText().toString().trim();
        String u = username.getText().toString().trim();
        String e = email.getText().toString().trim();
        String p = password.getText().toString();
        String cp = confirmPassword.getText().toString();
        String ph = phone.getText().toString().trim();
        String dob = dateOfBirth.getText().toString().trim();

        // Validation matching web
        if (f.isEmpty()) { showError("Full name is required"); return; }
        if (u.isEmpty()) { showError("Username is required"); return; }
        if (e.isEmpty()) { showError("Email is required"); return; }
        if (p.length() < 6) { showError("Password must be at least 6 characters"); return; }
        if (!p.equals(cp)) { showError("Passwords do not match"); return; }
        if (dob.isEmpty()) { showError("Date of birth is required"); return; }

        btnRegister.setEnabled(false);
        btnRegister.setText("Registering...");

        RegisterRequest r = new RegisterRequest();
        r.fullName = f;
        r.username = u;
        r.email = e;
        r.password = p;
        r.phoneNumber = ph.isEmpty() ? null : ph;
        r.dateOfBirth = dob.isEmpty() ? null : dob;
        r.gender = genderGroup.getCheckedRadioButtonId() == R.id.rbMale;

        new AuthRepository(this).register(r, new RepositoryCallback<RegisterResponse>() {
            public void onSuccess(RegisterResponse d) {
                ToastUtils.show(RegisterActivity.this, d.message);
                startActivity(new Intent(RegisterActivity.this, VerifyOtpActivity.class)
                    .putExtra(AppConstants.EXTRA_EMAIL, r.email));
                finish();
            }
            public void onError(String m) {
                btnRegister.setEnabled(true);
                btnRegister.setText("Register");
                showError(m);
            }
        });
    }

    private void showError(String msg) {
        tvError.setText(msg);
        tvError.setVisibility(TextView.VISIBLE);
    }
}
