package com.ptitshop.app.ui.checkout;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.ui.main.MainActivity;
import com.ptitshop.app.ui.order.OrderDetailActivity;

public class PaymentResultActivity extends BaseActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment_result);

        String orderId = getIntent().getStringExtra("orderId");

        TextView tvMessage = findViewById(R.id.tvMessage);
        TextView tvOrderDetails = findViewById(R.id.tvOrderDetails);
        View btnViewOrder = findViewById(R.id.btnViewOrder);

        if (orderId != null && !orderId.isEmpty()) {
            tvMessage.setText("Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được ghi nhận.");
            tvOrderDetails.setText(orderId);
            btnViewOrder.setVisibility(View.VISIBLE);
            btnViewOrder.setOnClickListener(v -> {
                Intent intent = new Intent(this, OrderDetailActivity.class);
                intent.putExtra("orderId", orderId);
                startActivity(intent);
                finish();
            });
        } else {
            tvMessage.setText("Đơn hàng của bạn đã được ghi nhận.");
            tvOrderDetails.setText("Đang xử lý");
            btnViewOrder.setVisibility(View.GONE);
        }

        findViewById(R.id.btnBackHome).setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
            finish();
        });
    }
}
