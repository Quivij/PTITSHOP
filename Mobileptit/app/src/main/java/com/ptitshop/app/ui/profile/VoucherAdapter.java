package com.ptitshop.app.ui.profile;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.ptitshop.app.R;
import com.ptitshop.app.data.model.Voucher;
import java.util.ArrayList;
import java.util.List;

public class VoucherAdapter extends RecyclerView.Adapter<VoucherAdapter.VH> {
    private final List<Voucher> items = new ArrayList<>();

    public void submit(List<Voucher> data) {
        items.clear();
        if (data != null) items.addAll(data);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new VH(LayoutInflater.from(parent.getContext()).inflate(R.layout.item_voucher, parent, false));
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        Voucher v = items.get(position);
        h.code.setText(v.code);
        h.value.setText(v.type + " - " + v.discountValue + " | Min: " + v.minOrderValue);
        h.expiry.setText("Het han: " + v.expiryDate);
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class VH extends RecyclerView.ViewHolder {
        TextView code, value, expiry;
        VH(View v) {
            super(v);
            code = v.findViewById(R.id.tvCode);
            value = v.findViewById(R.id.tvValue);
            expiry = v.findViewById(R.id.tvExpiry);
        }
    }
}
