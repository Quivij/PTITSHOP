package com.uteshop.app.ui.order;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RadioGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.uteshop.app.R;
import com.uteshop.app.core.base.BaseFragment;
import com.uteshop.app.core.utils.ToastUtils;
import com.uteshop.app.data.model.Order;
import com.uteshop.app.data.remote.dto.response.OrderListResponse;
import com.uteshop.app.data.remote.dto.response.OrderUpdateResponse;
import com.uteshop.app.repository.OrderRepository;
import com.uteshop.app.repository.RepositoryCallback;
import com.uteshop.app.ui.order.adapter.OrderAdapter;
import com.uteshop.app.ui.review.CreateReviewActivity;

public class OrderFragment extends BaseFragment {
    private OrderRepository repo;
    private OrderAdapter adapter;
    private TextView msg;
    private String status;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup c, @Nullable Bundle b) {
        View v = inflater.inflate(R.layout.fragment_order, c, false);
        repo = new OrderRepository(requireContext());
        adapter = new OrderAdapter();
        msg = v.findViewById(R.id.tvMessage);
        RecyclerView rv = v.findViewById(R.id.rvOrders);
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        rv.setAdapter(adapter);
        adapter.setListener(new OrderAdapter.Listener() {
            public void onDetail(Order order) { startActivity(new Intent(requireContext(), OrderDetailActivity.class).putExtra("orderId", order.id).putExtra("statusOrder", order.statusOrder)); }
            public void onCancel(Order order) { update(order, "pending"); }
            public void onReceived(Order order) { update(order, "delivering"); }
            public void onReview(Order order) { startActivity(new Intent(requireContext(), CreateReviewActivity.class).putExtra("orderId", order.id)); }
        });
        ((RadioGroup) v.findViewById(R.id.rgStatus)).setOnCheckedChangeListener((g, id) -> { status = map(id); load(); });
        load();
        return v;
    }

    private String map(int id) {
        if (id == R.id.rbPending) return "pending";
        if (id == R.id.rbPreparing) return "preparing";
        if (id == R.id.rbDelivering) return "delivering";
        if (id == R.id.rbDelivered) return "delivered";
        if (id == R.id.rbCancelled) return "cancelled";
        return null;
    }

    private void update(Order order, String currentStatus) {
        repo.updateStatus(order.id, currentStatus, new RepositoryCallback<OrderUpdateResponse>() {
            public void onSuccess(OrderUpdateResponse d) { ToastUtils.show(requireContext(), d.message); load(); }
            public void onError(String m) { ToastUtils.show(requireContext(), m); }
        });
    }

    private void load() {
        repo.orders(status, new RepositoryCallback<OrderListResponse>() {
            public void onSuccess(OrderListResponse d) {
                adapter.submit(d.data == null ? null : d.data.orders);
                msg.setText(d.data == null || d.data.orders == null || d.data.orders.isEmpty() ? "Khong co don hang" : "");
            }
            public void onError(String m) { msg.setText(m); }
        });
    }
}
