package com.uteshop.app.ui.home.adapter;

import android.view.*;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.uteshop.app.R;
import com.uteshop.app.data.model.Category;
import java.util.*;

public class CategoryAdapter extends RecyclerView.Adapter<CategoryAdapter.VH>{
    public interface OnClick {
        void onClick(Category c);
    }
    
    private final List<Category> items = new ArrayList<>();
    private String selectedId = "";
    private OnClick click;

    public void setOnClick(OnClick c) {
        click = c;
    }

    public void submit(List<Category> d) {
        items.clear();
        if (d != null) items.addAll(d);
        notifyDataSetChanged();
    }

    public void setSelectedId(String id) {
        selectedId = id != null ? id : "";
        notifyDataSetChanged();
    }

    public String getSelectedId() {
        return selectedId;
    }

    @NonNull public VH onCreateViewHolder(@NonNull ViewGroup p, int v) {
        return new VH(LayoutInflater.from(p.getContext()).inflate(R.layout.item_category, p, false));
    }

    public void onBindViewHolder(@NonNull VH h, int pos) {
        Category c = items.get(pos);
        h.name.setText(c.name);
        
        if (c.id != null && c.id.equals(selectedId)) {
            h.name.setBackgroundResource(R.drawable.bg_category_pill_selected);
            h.name.setTextColor(ContextCompat.getColor(h.name.getContext(), R.color.white));
        } else {
            h.name.setBackgroundResource(R.drawable.bg_category_pill);
            h.name.setTextColor(ContextCompat.getColor(h.name.getContext(), R.color.colorPrimary));
        }

        h.itemView.setOnClickListener(v -> {
            if (click != null) click.onClick(c);
        });
    }

    public int getItemCount() {
        return items.size();
    }

    static class VH extends RecyclerView.ViewHolder {
        TextView name;
        VH(View v) {
            super(v);
            name = v.findViewById(R.id.tvProductName);
        }
    }
}
