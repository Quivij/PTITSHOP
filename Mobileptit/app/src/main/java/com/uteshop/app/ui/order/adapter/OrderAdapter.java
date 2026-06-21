package com.uteshop.app.ui.order.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.uteshop.app.R;
import com.uteshop.app.core.utils.CurrencyUtils;
import com.uteshop.app.data.model.Order;
import com.uteshop.app.data.model.OrderItem;
import java.util.ArrayList;
import java.util.List;

public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.VH> {
    public interface Listener {
        void onDetail(Order order);
        void onCancel(Order order);
        void onReceived(Order order);
        void onReview(Order order);
    }

    private final List<Order> items = new ArrayList<>();
    private Listener listener;

    public void setListener(Listener listener) {
        this.listener = listener;
    }

    public void submit(List<Order> data) {
        items.clear();
        if (data != null) items.addAll(data);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new VH(LayoutInflater.from(parent.getContext()).inflate(R.layout.item_order, parent, false));
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        Order order = items.get(position);
        
        // Show last 8 chars of id
        String shortId = order.id;
        if (shortId != null && shortId.length() > 8) {
            shortId = shortId.substring(shortId.length() - 8);
        }
        h.id.setText("Mã đơn: #" + shortId);
        
        // Map status order to Vietnamese & style badge
        String statusText = order.statusOrder != null ? order.statusOrder : "pending";
        String statusVi = statusText;
        switch (statusText) {
            case "pending":
                statusVi = "Chờ xác nhận";
                h.status.setTextColor(h.itemView.getResources().getColor(R.color.colorAccent));
                break;
            case "preparing":
                statusVi = "Đang chuẩn bị";
                h.status.setTextColor(h.itemView.getResources().getColor(R.color.colorPrimary));
                break;
            case "delivering":
                statusVi = "Đang giao";
                h.status.setTextColor(h.itemView.getResources().getColor(R.color.colorPrimaryDark));
                break;
            case "delivered":
                statusVi = "Đã giao";
                h.status.setTextColor(h.itemView.getResources().getColor(R.color.colorSuccess));
                break;
            case "cancelled":
                statusVi = "Đã hủy";
                h.status.setTextColor(h.itemView.getResources().getColor(R.color.colorError));
                break;
        }
        h.status.setText(statusVi);
        h.total.setText(CurrencyUtils.formatVnd(order.totalPrice));

        // Set up product preview row
        if (order.items != null && !order.items.isEmpty()) {
            h.productPreviewContainer.setVisibility(View.VISIBLE);
            OrderItem firstItem = order.items.get(0);
            if (firstItem.product != null) {
                h.productName.setText(firstItem.product.name);
                h.quantity.setText("Số lượng: " + firstItem.quantity);
                if (firstItem.product.images != null && !firstItem.product.images.isEmpty()) {
                    Glide.with(h.itemView.getContext())
                            .load(firstItem.product.images.get(0).url)
                            .placeholder(R.drawable.ic_cart)
                            .error(R.drawable.ic_cart)
                            .into(h.imgProduct);
                } else {
                    h.imgProduct.setImageResource(R.drawable.ic_cart);
                }
            }

            if (order.items.size() > 1) {
                h.moreItems.setVisibility(View.VISIBLE);
                h.moreItems.setText("+ " + (order.items.size() - 1) + " sản phẩm khác");
            } else {
                h.moreItems.setVisibility(View.GONE);
            }
        } else {
            h.productPreviewContainer.setVisibility(View.GONE);
            h.moreItems.setVisibility(View.GONE);
        }

        boolean pending = "pending".equals(order.statusOrder);
        boolean delivering = "delivering".equals(order.statusOrder);
        boolean delivered = "delivered".equals(order.statusOrder);
        
        h.cancel.setVisibility(pending ? View.VISIBLE : View.GONE);
        h.received.setVisibility(delivering ? View.VISIBLE : View.GONE);
        h.review.setVisibility(delivered ? View.VISIBLE : View.GONE);
        
        h.detail.setOnClickListener(v -> { if (listener != null) listener.onDetail(order); });
        h.cancel.setOnClickListener(v -> { if (listener != null) listener.onCancel(order); });
        h.received.setOnClickListener(v -> { if (listener != null) listener.onReceived(order); });
        h.review.setOnClickListener(v -> { if (listener != null) listener.onReview(order); });
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class VH extends RecyclerView.ViewHolder {
        TextView id, status, total, productName, quantity, moreItems;
        ImageView imgProduct;
        View productPreviewContainer;
        Button detail, cancel, received, review;

        VH(View v) {
            super(v);
            id = v.findViewById(R.id.tvOrderId);
            status = v.findViewById(R.id.tvStatus);
            total = v.findViewById(R.id.tvTotal);
            productName = v.findViewById(R.id.tvProductName);
            quantity = v.findViewById(R.id.tvQuantity);
            moreItems = v.findViewById(R.id.tvMoreItems);
            imgProduct = v.findViewById(R.id.imgProduct);
            productPreviewContainer = v.findViewById(R.id.llProductPreview);
            detail = v.findViewById(R.id.btnDetail);
            cancel = v.findViewById(R.id.btnCancel);
            received = v.findViewById(R.id.btnReceived);
            review = v.findViewById(R.id.btnReview);
        }
    }
}
