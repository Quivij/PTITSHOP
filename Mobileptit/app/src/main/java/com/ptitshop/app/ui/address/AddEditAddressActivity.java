package com.ptitshop.app.ui.address;

import android.os.Bundle;
import android.widget.CheckBox;
import android.widget.EditText;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.core.utils.ToastUtils;
import com.ptitshop.app.data.remote.dto.request.DeliveryAddressRequest;
import com.ptitshop.app.data.remote.dto.response.DeliveryAddressResponse;
import com.ptitshop.app.repository.DeliveryAddressRepository;
import com.ptitshop.app.repository.RepositoryCallback;

public class AddEditAddressActivity extends BaseActivity {
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_add_edit_address);
        String addressId = getIntent().getStringExtra("addressId");
        EditText addr = findViewById(R.id.edtAddressName);
        EditText buyer = findViewById(R.id.edtBuyerName);
        EditText phone = findViewById(R.id.edtPhone);
        EditText note = findViewById(R.id.edtNote);
        CheckBox def = findViewById(R.id.chkDefault);
        findViewById(R.id.btnSave).setOnClickListener(v -> {
            DeliveryAddressRequest r = new DeliveryAddressRequest();
            r.addressName = addr.getText().toString();
            r.nameBuyer = buyer.getText().toString();
            r.phoneNumber = phone.getText().toString();
            r.note = note.getText().toString();
            r.defaultAddress = def.isChecked();
            DeliveryAddressRepository repo = new DeliveryAddressRepository(this);
            RepositoryCallback<DeliveryAddressResponse> cb = new RepositoryCallback<DeliveryAddressResponse>() {
                public void onSuccess(DeliveryAddressResponse d) {
                    ToastUtils.show(AddEditAddressActivity.this, "Da luu dia chi");
                    finish();
                }
                public void onError(String m) { ToastUtils.show(AddEditAddressActivity.this, m); }
            };
            if (addressId == null || addressId.isEmpty()) repo.create(r, cb); else repo.update(addressId, r, cb);
        });
    }
}
