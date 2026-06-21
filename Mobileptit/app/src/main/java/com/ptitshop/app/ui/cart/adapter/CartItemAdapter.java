package com.ptitshop.app.ui.cart.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.ptitshop.app.R;
import com.ptitshop.app.core.utils.CurrencyUtils;
import com.ptitshop.app.core.utils.ImageUtils;
import com.ptitshop.app.data.model.CartItem;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class CartItemAdapter extends RecyclerView.Adapter<CartItemAdapter.VH> {
    public interface Listener {
        void onPlus(CartItem item);
        void onMinus(CartItem item);
        void onRemove(CartItem item);
        void onSelectionChanged();
    }

    private final List<CartItem> items = new ArrayList<>();
    private final Set<String> selectedIds = new HashSet<>();
    private Listener listener;

    public void setListener(Listener listener) {
        this.listener = listener;
    }

    public void submit(List<CartItem> data) {
        items.clear();
        if (data != null) items.addAll(data);
        selectedIds.clear();
        notifyDataSetChanged();
    }

    public List<String> getSelectedProductIds() {
        return new ArrayList<>(selectedIds);
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new VH(LayoutInflater.from(parent.getContext()).inflate(R.layout.item_cart, parent, false));
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        CartItem item = items.get(position);
        String id = item.product == null ? null : item.product.id;
        h.name.setText(item.product == null ? "San pham" : item.product.name);
        h.price.setText(item.product == null ? "" : CurrencyUtils.formatVnd(item.product.price));
        h.quantity.setText(String.valueOf(item.quantity == null ? 0 : item.quantity));
        if (item.product != null) ImageUtils.load(h.image, item.product.firstImageUrl());
        h.select.setOnCheckedChangeListener(null);
        h.select.setChecked(id != null && selectedIds.contains(id));
        h.select.setOnCheckedChangeListener((buttonView, checked) -> {
            if (id != null) {
                if (checked) selectedIds.add(id); else selectedIds.remove(id);
            }
            if (listener != null) listener.onSelectionChanged();
        });
        h.plus.setOnClickListener(v -> { if (listener != null) listener.onPlus(item); });
        h.minus.setOnClickListener(v -> { if (listener != null) listener.onMinus(item); });
        h.remove.setOnClickListener(v -> { if (listener != null) listener.onRemove(item); });
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class VH extends RecyclerView.ViewHolder {
        CheckBox select;
        ImageView image;
        TextView name, price, quantity;
        Button plus, minus, remove;

        VH(View v) {
            super(v);
            select = v.findViewById(R.id.chkSelect);
            image = v.findViewById(R.id.imgProduct);
            name = v.findViewById(R.id.tvProductName);
            price = v.findViewById(R.id.tvPrice);
            quantity = v.findViewById(R.id.tvQuantity);
            plus = v.findViewById(R.id.btnPlus);
            minus = v.findViewById(R.id.btnMinus);
            remove = v.findViewById(R.id.btnRemove);
        }
    }
}
