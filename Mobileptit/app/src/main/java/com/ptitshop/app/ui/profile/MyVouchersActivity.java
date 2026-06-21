package com.ptitshop.app.ui.profile;

import android.os.Bundle;
import android.widget.TextView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.data.remote.dto.response.MyVoucherResponse;
import com.ptitshop.app.repository.RepositoryCallback;
import com.ptitshop.app.repository.VoucherRepository;

public class MyVouchersActivity extends BaseActivity {
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_my_vouchers);
        TextView xu = findViewById(R.id.tvXu), msg = findViewById(R.id.tvMessage);
        VoucherAdapter adapter = new VoucherAdapter();
        RecyclerView rv = findViewById(R.id.rvVouchers);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(adapter);
        new VoucherRepository(this).mine(new RepositoryCallback<MyVoucherResponse>() {
            public void onSuccess(MyVoucherResponse d) {
                xu.setText("Xu: " + (d.xu == null ? 0 : d.xu));
                adapter.submit(d.vouchers);
                msg.setText(d.vouchers == null || d.vouchers.isEmpty() ? "Chua co voucher" : "");
            }
            public void onError(String m) { msg.setText(m); }
        });
    }
}
