package com.ptitshop.app.ui.address;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.core.utils.ToastUtils;
import com.ptitshop.app.data.model.DeliveryAddress;
import com.ptitshop.app.data.remote.dto.response.DeliveryAddressListResponse;
import com.ptitshop.app.data.remote.dto.response.DeliveryAddressResponse;
import com.ptitshop.app.repository.DeliveryAddressRepository;
import com.ptitshop.app.repository.RepositoryCallback;

public class DeliveryAddressActivity extends BaseActivity {
    private DeliveryAddressRepository repo;
    private AddressAdapter adapter;
    private TextView msg;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_delivery_address);
        repo = new DeliveryAddressRepository(this);
        msg = findViewById(R.id.tvMessage);
        adapter = new AddressAdapter();
        RecyclerView rv = findViewById(R.id.rvAddresses);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(adapter);
        adapter.setListener(new AddressAdapter.Listener() {
            public void onDefault(DeliveryAddress address) { setDefault(address); }
            public void onEdit(DeliveryAddress address) { startActivity(new Intent(DeliveryAddressActivity.this, AddEditAddressActivity.class).putExtra("addressId", address.id)); }
            public void onDelete(DeliveryAddress address) { delete(address); }
        });
        findViewById(R.id.btnAdd).setOnClickListener(v -> startActivity(new Intent(this, AddEditAddressActivity.class)));
    }

    @Override
    protected void onResume() {
        super.onResume();
        load();
    }

    private void load() {
        repo.list(new RepositoryCallback<DeliveryAddressListResponse>() {
            public void onSuccess(DeliveryAddressListResponse d) {
                adapter.submit(d.data);
                msg.setText(d.data == null || d.data.isEmpty() ? "Chua co dia chi" : "Co " + d.data.size() + " dia chi");
            }
            public void onError(String m) { msg.setText(m); }
        });
    }

    private void setDefault(DeliveryAddress address) {
        repo.setDefault(address.id, simpleCallback("Da dat mac dinh"));
    }

    private void delete(DeliveryAddress address) {
        repo.delete(address.id, simpleCallback("Da xoa dia chi"));
    }

    private RepositoryCallback<DeliveryAddressResponse> simpleCallback(String ok) {
        return new RepositoryCallback<DeliveryAddressResponse>() {
            public void onSuccess(DeliveryAddressResponse d) { ToastUtils.show(DeliveryAddressActivity.this, ok); load(); }
            public void onError(String m) { ToastUtils.show(DeliveryAddressActivity.this, m); }
        };
    }
}
