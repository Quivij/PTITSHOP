package com.uteshop.app.ui.checkout.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.uteshop.app.R;
import com.uteshop.app.data.model.DeliveryAddress;
import java.util.ArrayList;
import java.util.List;

public class CheckoutAddressAdapter extends RecyclerView.Adapter<CheckoutAddressAdapter.ViewHolder> {
    private final List<DeliveryAddress> list = new ArrayList<>();
    private String selectedAddressId = null;
    private OnAddressSelectedListener listener;

    public interface OnAddressSelectedListener {
        void onAddressSelected(DeliveryAddress address);
    }

    public void setOnAddressSelectedListener(OnAddressSelectedListener l) {
        this.listener = l;
    }

    public void submit(List<DeliveryAddress> data) {
        this.list.clear();
        if (data != null) {
            this.list.addAll(data);
            // Default to selection of default address if not set
            if (selectedAddressId == null) {
                for (DeliveryAddress addr : data) {
                    if (Boolean.TRUE.equals(addr.defaultAddress)) {
                        selectedAddressId = addr.id;
                        if (listener != null) listener.onAddressSelected(addr);
                        break;
                    }
                }
                if (selectedAddressId == null && !data.isEmpty()) {
                    selectedAddressId = data.get(0).id;
                    if (listener != null) listener.onAddressSelected(data.get(0));
                }
            }
        }
        notifyDataSetChanged();
    }

    public String getSelectedAddressId() {
        return selectedAddressId;
    }

    public void setSelectedAddressId(String id) {
        this.selectedAddressId = id;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_checkout_address, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        DeliveryAddress addr = list.get(position);
        holder.tvBuyerName.setText(addr.nameBuyer);
        holder.tvPhoneNumber.setText("SĐT: " + addr.phoneNumber);
        holder.tvAddressText.setText("Địa chỉ: " + addr.addressName);
        
        if (addr.note != null && !addr.note.trim().isEmpty()) {
            holder.tvNote.setVisibility(View.VISIBLE);
            holder.tvNote.setText("Ghi chú: " + addr.note);
        } else {
            holder.tvNote.setVisibility(View.GONE);
        }

        if (Boolean.TRUE.equals(addr.defaultAddress)) {
            holder.tvDefaultBadge.setVisibility(View.VISIBLE);
        } else {
            holder.tvDefaultBadge.setVisibility(View.GONE);
        }

        boolean isSelected = addr.id != null && addr.id.equals(selectedAddressId);
        holder.llContainer.setBackgroundResource(isSelected ? R.drawable.bg_category_pill_selected : R.drawable.bg_category_pill);

        holder.itemView.setOnClickListener(v -> {
            selectedAddressId = addr.id;
            notifyDataSetChanged();
            if (listener != null) {
                listener.onAddressSelected(addr);
            }
        });
    }

    @Override
    public int getItemCount() {
        return list.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvBuyerName, tvPhoneNumber, tvAddressText, tvNote, tvDefaultBadge;
        LinearLayout llContainer;

        ViewHolder(View itemView) {
            super(itemView);
            tvBuyerName = itemView.findViewById(R.id.tvBuyerName);
            tvPhoneNumber = itemView.findViewById(R.id.tvPhoneNumber);
            tvAddressText = itemView.findViewById(R.id.tvAddressText);
            tvNote = itemView.findViewById(R.id.tvNote);
            tvDefaultBadge = itemView.findViewById(R.id.tvDefaultBadge);
            llContainer = itemView.findViewById(R.id.llContainer);
        }
    }
}
