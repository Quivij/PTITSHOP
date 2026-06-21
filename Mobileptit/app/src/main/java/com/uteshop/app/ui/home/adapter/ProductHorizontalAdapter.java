package com.uteshop.app.ui.home.adapter;

import android.view.*;
import android.widget.*;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.uteshop.app.R;
import com.uteshop.app.core.utils.CurrencyUtils;
import com.uteshop.app.core.utils.ImageUtils;
import com.uteshop.app.data.model.Product;
import java.util.*;

public class ProductHorizontalAdapter extends RecyclerView.Adapter<ProductHorizontalAdapter.VH>{
    public interface OnClick{
        void onClick(Product p);
    }
    private final List<Product>items=new ArrayList<>();
    private OnClick click;
    public void setOnClick(OnClick c) {
        click=c;
    }
    public void submit(List<Product>data) {
        items.clear();
        if(data!=null)items.addAll(data);
        notifyDataSetChanged();
    }
    @NonNull public VH onCreateViewHolder(@NonNull ViewGroup p, int v) {
        return new VH(LayoutInflater.from(p.getContext()).inflate(R.layout.item_product_horizontal, p, false));
    }
    public void onBindViewHolder(@NonNull VH h, int pos) {
        Product p=items.get(pos);
        h.name.setText(p.name==null?"San pham":p.name);
        h.price.setText(CurrencyUtils.formatVnd(p.price));
        ImageUtils.load(h.img, p.firstImageUrl());
        h.itemView.setOnClickListener(v->{
            if(click!=null)click.onClick(p);
        }
        );
    }
    public int getItemCount() {
        return items.size();
    }
    static class VH extends RecyclerView.ViewHolder{
        TextView name, price;
        ImageView img;
        VH(View v) {
            super(v);
            name=v.findViewById(R.id.tvProductName);
            price=v.findViewById(R.id.tvPrice);
            img=v.findViewById(R.id.imgProduct);
        }
    }
}
