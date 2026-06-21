package com.ptitshop.app.ui.profile;

import android.os.Bundle;
import android.widget.CheckBox;
import android.widget.EditText;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.core.utils.ToastUtils;
import com.ptitshop.app.data.remote.dto.request.UpdateProfileRequest;
import com.ptitshop.app.data.remote.dto.response.ProfileResponse;
import com.ptitshop.app.data.remote.dto.response.ProfileUpdateResponse;
import com.ptitshop.app.repository.RepositoryCallback;
import com.ptitshop.app.repository.UserRepository;

public class EditProfileActivity extends BaseActivity {
    private EditText fullName, phone, dob, avatar;
    private CheckBox gender;
    private UserRepository repo;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_edit_profile);
        repo = new UserRepository(this);
        fullName = findViewById(R.id.edtFullName);
        phone = findViewById(R.id.edtPhone);
        dob = findViewById(R.id.edtDateOfBirth);
        avatar = findViewById(R.id.edtAvatar);
        gender = findViewById(R.id.chkGender);
        repo.profile(new RepositoryCallback<ProfileResponse>() {
            public void onSuccess(ProfileResponse d) {
                if (d.data == null) return;
                fullName.setText(d.data.fullName);
                phone.setText(d.data.phoneNumber);
                dob.setText(d.data.dateOfBirth);
                avatar.setText(d.data.avt);
                gender.setChecked(Boolean.TRUE.equals(d.data.gender));
            }
            public void onError(String m) { ToastUtils.show(EditProfileActivity.this, m); }
        });
        findViewById(R.id.btnSave).setOnClickListener(v -> save());
    }

    private void save() {
        UpdateProfileRequest r = new UpdateProfileRequest();
        r.fullName = fullName.getText().toString();
        r.phoneNumber = phone.getText().toString();
        r.dateOfBirth = dob.getText().toString();
        r.avt = avatar.getText().toString();
        r.gender = gender.isChecked();
        repo.update(r, new RepositoryCallback<ProfileUpdateResponse>() {
            public void onSuccess(ProfileUpdateResponse d) { ToastUtils.show(EditProfileActivity.this, "Da cap nhat ho so"); finish(); }
            public void onError(String m) { ToastUtils.show(EditProfileActivity.this, m); }
        });
    }
}
