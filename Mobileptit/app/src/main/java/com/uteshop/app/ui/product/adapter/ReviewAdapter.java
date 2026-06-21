package com.uteshop.app.ui.product.adapter;

import androidx.recyclerview.widget.RecyclerView;
import android.view.*;
import android.widget.TextView;
import androidx.annotation.NonNull;
import com.uteshop.app.R;
import com.uteshop.app.data.model.Review;
import java.util.*;

public class ReviewAdapter extends RecyclerView.Adapter<ReviewAdapter.VH>{
    private final List<Review>items=new ArrayList<>();
    public void submit(List<Review>d) {
        items.clear();
        if(d!=null)items.addAll(d);
        notifyDataSetChanged();
    }
    @NonNull public VH onCreateViewHolder(@NonNull ViewGroup p, int v) {
        return new VH(LayoutInflater.from(p.getContext()).inflate(R.layout.item_review, p, false));
    }
    public void onBindViewHolder(@NonNull VH h, int p) {
        h.name.setText("Rating: "+items.get(p).rating);
        h.price.setText(items.get(p).comment);
    }
    public int getItemCount() {
        return items.size();
    }
    static class VH extends RecyclerView.ViewHolder{
        TextView name, price;
        VH(View v) {
            super(v);
            name=v.findViewById(R.id.tvProductName);
            price=v.findViewById(R.id.tvPrice);
        }
    }
}
