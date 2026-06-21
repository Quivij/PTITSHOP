package com.uteshop.app.ui.address;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.uteshop.app.R;
import com.uteshop.app.data.model.DeliveryAddress;
import java.util.ArrayList;
import java.util.List;

public class AddressAdapter extends RecyclerView.Adapter<AddressAdapter.VH> {
    public interface Listener {
        void onDefault(DeliveryAddress address);
        void onEdit(DeliveryAddress address);
        void onDelete(DeliveryAddress address);
    }

    private final List<DeliveryAddress> items = new ArrayList<>();
    private Listener listener;

    public void setListener(Listener listener) { this.listener = listener; }

    public void submit(List<DeliveryAddress> data) {
        items.clear();
        if (data != null) items.addAll(data);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new VH(LayoutInflater.from(parent.getContext()).inflate(R.layout.item_address, parent, false));
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        DeliveryAddress a = items.get(position);
        h.address.setText((Boolean.TRUE.equals(a.defaultAddress) ? "[Default] " : "") + a.addressName);
        h.buyer.setText(a.nameBuyer + " - " + (a.phoneNumber == null ? "" : a.phoneNumber));
        h.note.setText(a.note == null ? "" : a.note);
        h.def.setOnClickListener(v -> { if (listener != null) listener.onDefault(a); });
        h.edit.setOnClickListener(v -> { if (listener != null) listener.onEdit(a); });
        h.delete.setOnClickListener(v -> { if (listener != null) listener.onDelete(a); });
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class VH extends RecyclerView.ViewHolder {
        TextView address, buyer, note;
        Button def, edit, delete;
        VH(View v) {
            super(v);
            address = v.findViewById(R.id.tvAddressName);
            buyer = v.findViewById(R.id.tvBuyer);
            note = v.findViewById(R.id.tvNote);
            def = v.findViewById(R.id.btnDefault);
            edit = v.findViewById(R.id.btnEdit);
            delete = v.findViewById(R.id.btnDelete);
        }
    }
}
