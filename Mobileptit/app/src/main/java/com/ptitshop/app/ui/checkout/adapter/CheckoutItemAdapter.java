package com.ptitshop.app.ui.checkout.adapter;

import android.graphics.Paint;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.ptitshop.app.R;
import com.ptitshop.app.core.utils.CurrencyUtils;
import com.ptitshop.app.data.model.CartItem;
import java.util.ArrayList;
import java.util.List;

public class CheckoutItemAdapter extends RecyclerView.Adapter<CheckoutItemAdapter.ViewHolder> {
    private final List<CartItem> list = new ArrayList<>();

    public void submit(List<CartItem> data) {
        this.list.clear();
        if (data != null) {
            this.list.addAll(data);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_checkout_product, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        CartItem item = list.get(position);
        if (item.product == null) return;

        holder.tvProductName.setText(item.product.name);
        holder.tvQuantity.setText("Số lượng: " + item.quantity);

        double originalPrice = item.product.price;
        double discountPercent = item.product.discount != null ? item.product.discount : 0;
        double finalUnitPrice = originalPrice * (1.0 - (discountPercent / 100.0));
        
        double totalItemPrice = finalUnitPrice * item.quantity;
        holder.tvPrice.setText(CurrencyUtils.formatVnd(totalItemPrice));

        if (discountPercent > 0) {
            holder.tvOriginalPrice.setVisibility(View.VISIBLE);
            holder.tvOriginalPrice.setText(CurrencyUtils.formatVnd(originalPrice * item.quantity));
            holder.tvOriginalPrice.setPaintFlags(holder.tvOriginalPrice.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
        } else {
            holder.tvOriginalPrice.setVisibility(View.GONE);
        }

        if (item.product.images != null && !item.product.images.isEmpty()) {
            Glide.with(holder.itemView.getContext())
                    .load(item.product.images.get(0).url)
                    .placeholder(R.drawable.ic_cart)
                    .error(R.drawable.ic_cart)
                    .into(holder.imgProduct);
        } else {
            holder.imgProduct.setImageResource(R.drawable.ic_cart);
        }
    }

    @Override
    public int getItemCount() {
        return list.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView imgProduct;
        TextView tvProductName, tvQuantity, tvPrice, tvOriginalPrice;

        ViewHolder(View itemView) {
            super(itemView);
            imgProduct = itemView.findViewById(R.id.imgProduct);
            tvProductName = itemView.findViewById(R.id.tvProductName);
            tvQuantity = itemView.findViewById(R.id.tvQuantity);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvOriginalPrice = itemView.findViewById(R.id.tvOriginalPrice);
        }
    }
}
