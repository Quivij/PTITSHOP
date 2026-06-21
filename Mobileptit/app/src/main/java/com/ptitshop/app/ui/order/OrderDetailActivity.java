package com.ptitshop.app.ui.order;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.gson.Gson;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.core.utils.CurrencyUtils;
import com.ptitshop.app.core.utils.ToastUtils;
import com.ptitshop.app.data.model.DeliveryAddress;
import com.ptitshop.app.data.model.Order;
import com.ptitshop.app.data.remote.dto.response.OrderListResponse;
import com.ptitshop.app.data.remote.dto.response.OrderUpdateResponse;
import com.ptitshop.app.repository.OrderRepository;
import com.ptitshop.app.repository.RepositoryCallback;
import com.ptitshop.app.ui.order.adapter.OrderDetailItemAdapter;
import com.ptitshop.app.ui.review.CreateReviewActivity;

public class OrderDetailActivity extends BaseActivity {
    private String orderId;
    private String statusOrder;
    private OrderRepository repo;

    private TextView tvDetailStatus, tvOrderDate, tvDetailOrderId;
    private TextView tvBuyerName, tvPhoneNumber, tvAddress, tvNote;
    private RecyclerView rvItems;
    private OrderDetailItemAdapter itemAdapter;

    private TextView tvSubtotal, tvVoucherDiscount, tvXuUsed, tvPaymentMethod, tvTotal;
    private Button btnCancel, btnReceived, btnReview;
    private View cvActionArea;
    private TextView tvMessage;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_detail);

        orderId = getIntent().getStringExtra("orderId");
        statusOrder = getIntent().getStringExtra("statusOrder");
        repo = new OrderRepository(this);

        initViews();
        loadOrderDetail();
    }

    private void initViews() {
        tvDetailStatus = findViewById(R.id.tvDetailStatus);
        tvOrderDate = findViewById(R.id.tvOrderDate);
        tvDetailOrderId = findViewById(R.id.tvDetailOrderId);

        tvBuyerName = findViewById(R.id.tvBuyerName);
        tvPhoneNumber = findViewById(R.id.tvPhoneNumber);
        tvAddress = findViewById(R.id.tvAddress);
        tvNote = findViewById(R.id.tvNote);

        rvItems = findViewById(R.id.rvItems);
        rvItems.setLayoutManager(new LinearLayoutManager(this));
        itemAdapter = new OrderDetailItemAdapter();
        rvItems.setAdapter(itemAdapter);

        tvSubtotal = findViewById(R.id.tvSubtotal);
        tvVoucherDiscount = findViewById(R.id.tvVoucherDiscount);
        tvXuUsed = findViewById(R.id.tvXuUsed);
        tvPaymentMethod = findViewById(R.id.tvPaymentMethod);
        tvTotal = findViewById(R.id.tvTotal);

        btnCancel = findViewById(R.id.btnCancel);
        btnReceived = findViewById(R.id.btnReceived);
        btnReview = findViewById(R.id.btnReview);
        cvActionArea = findViewById(R.id.cvActionArea);
        tvMessage = findViewById(R.id.tvMessage);

        btnCancel.setOnClickListener(v -> update("pending"));
        btnReceived.setOnClickListener(v -> update("delivering"));
        btnReview.setOnClickListener(v -> {
            Intent intent = new Intent(this, CreateReviewActivity.class);
            intent.putExtra("orderId", orderId);
            startActivity(intent);
        });
    }

    private void loadOrderDetail() {
        tvMessage.setText("Đang tải chi tiết đơn hàng...");
        repo.orders(null, new RepositoryCallback<OrderListResponse>() {
            @Override
            public void onSuccess(OrderListResponse response) {
                tvMessage.setText("");
                Order targetOrder = null;
                if (response.data != null && response.data.orders != null) {
                    for (Order order : response.data.orders) {
                        if (order.id != null && order.id.equals(orderId)) {
                            targetOrder = order;
                            break;
                        }
                    }
                }

                if (targetOrder != null) {
                    bindOrderDetails(targetOrder);
                } else {
                    tvMessage.setText("Không tìm thấy đơn hàng này.");
                }
            }

            @Override
            public void onError(String message) {
                tvMessage.setText(message);
            }
        });
    }

    private void bindOrderDetails(Order order) {
        // Status & IDs
        String statusText = order.statusOrder != null ? order.statusOrder : "pending";
        String statusVi = statusText;
        switch (statusText) {
            case "pending":
                statusVi = "Chờ xác nhận";
                tvDetailStatus.setTextColor(getResources().getColor(R.color.colorAccent));
                break;
            case "preparing":
                statusVi = "Đang chuẩn bị";
                tvDetailStatus.setTextColor(getResources().getColor(R.color.colorPrimary));
                break;
            case "delivering":
                statusVi = "Đang giao hàng";
                tvDetailStatus.setTextColor(getResources().getColor(R.color.colorPrimaryDark));
                break;
            case "delivered":
                statusVi = "Đã giao hàng thành công";
                tvDetailStatus.setTextColor(getResources().getColor(R.color.colorSuccess));
                break;
            case "cancelled":
                statusVi = "Đã hủy đơn hàng";
                tvDetailStatus.setTextColor(getResources().getColor(R.color.colorError));
                break;
        }
        tvDetailStatus.setText(statusVi);

        if (order.createdAt != null) {
            String dateText = order.createdAt;
            if (dateText.contains("T")) {
                dateText = dateText.split("T")[0];
            }
            tvOrderDate.setText("Ngày đặt: " + dateText);
        } else {
            tvOrderDate.setVisibility(View.GONE);
        }

        tvDetailOrderId.setText("Mã đơn hàng: #" + order.id);

        // Address
        DeliveryAddress address = null;
        if (order.deliveryAddressId != null && order.deliveryAddressId.isJsonObject()) {
            address = new Gson().fromJson(order.deliveryAddressId, DeliveryAddress.class);
        }

        if (address != null) {
            tvBuyerName.setText("Tên người nhận: " + address.nameBuyer);
            tvPhoneNumber.setText("Số điện thoại: " + address.phoneNumber);
            tvAddress.setText("Địa chỉ: " + address.addressName);
            if (address.note != null && !address.note.trim().isEmpty()) {
                tvNote.setVisibility(View.VISIBLE);
                tvNote.setText("Ghi chú: " + address.note);
            } else {
                tvNote.setVisibility(View.GONE);
            }
        } else {
            tvBuyerName.setText("Thông tin người nhận không khả dụng");
            tvPhoneNumber.setVisibility(View.GONE);
            tvAddress.setVisibility(View.GONE);
            tvNote.setVisibility(View.GONE);
        }

        // Items List
        itemAdapter.submit(order.items);

        // Calculations
        double finalTotal = order.totalPrice != null ? order.totalPrice : 0;
        double discount = order.discountAmount != null ? order.discountAmount : 0;
        int xuUsed = order.usedXu != null ? order.usedXu : 0;
        double subTotal = finalTotal + discount + xuUsed;

        tvSubtotal.setText(CurrencyUtils.formatVnd(subTotal));
        tvVoucherDiscount.setText("- " + CurrencyUtils.formatVnd(discount));
        tvXuUsed.setText("- " + CurrencyUtils.formatVnd(xuUsed));
        tvTotal.setText(CurrencyUtils.formatVnd(finalTotal));

        // Payment Method
        String payment = "Thanh toán khi nhận hàng (COD)";
        if (order.paymentInfo != null) {
            payment = "Thanh toán trực tuyến (VNPay)";
        }
        tvPaymentMethod.setText(payment);

        // Actions visibility
        boolean pending = "pending".equals(statusText);
        boolean delivering = "delivering".equals(statusText);
        boolean delivered = "delivered".equals(statusText);

        btnCancel.setVisibility(pending ? View.VISIBLE : View.GONE);
        btnReceived.setVisibility(delivering ? View.VISIBLE : View.GONE);
        btnReview.setVisibility(delivered ? View.VISIBLE : View.GONE);

        if (!pending && !delivering && !delivered) {
            cvActionArea.setVisibility(View.GONE);
        } else {
            cvActionArea.setVisibility(View.VISIBLE);
        }
    }

    private void update(String currentStatus) {
        tvMessage.setText("Đang cập nhật trạng thái đơn hàng...");
        repo.updateStatus(orderId, currentStatus, new RepositoryCallback<OrderUpdateResponse>() {
            @Override
            public void onSuccess(OrderUpdateResponse response) {
                ToastUtils.show(OrderDetailActivity.this, response.message);
                finish();
            }

            @Override
            public void onError(String message) {
                tvMessage.setText(message);
            }
        });
    }
}
