package com.ptitshop.app.ui.product;

import android.graphics.Paint;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.core.constants.AppConstants;
import com.ptitshop.app.core.utils.CurrencyUtils;
import com.ptitshop.app.core.utils.ImageUtils;
import com.ptitshop.app.core.utils.ToastUtils;
import com.ptitshop.app.data.model.Product;
import com.ptitshop.app.data.remote.dto.response.*;
import com.ptitshop.app.repository.*;
import com.ptitshop.app.ui.product.adapter.ProductGridAdapter;
import android.content.Intent;
import com.ptitshop.app.ui.main.MainActivity;
import java.util.List;

public class ProductDetailActivity extends BaseActivity {
    private String productId;
    private Product product;
    
    private TextView name, price, tvOriginalPrice, tvDiscountBadge;
    private TextView tvCategory, tvStock, tvQuantity;
    private TextView meta, desc, msg;
    private ImageView image;
    private int quantity = 1;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_product_detail);
        productId = getIntent().getStringExtra(AppConstants.EXTRA_PRODUCT_ID);
        
        name = findViewById(R.id.tvProductName);
        price = findViewById(R.id.tvPrice);
        tvOriginalPrice = findViewById(R.id.tvOriginalPrice);
        tvDiscountBadge = findViewById(R.id.tvDiscountBadge);
        tvCategory = findViewById(R.id.tvCategory);
        tvStock = findViewById(R.id.tvStock);
        tvQuantity = findViewById(R.id.tvQuantity);
        meta = findViewById(R.id.tvMeta);
        desc = findViewById(R.id.tvDescription);
        msg = findViewById(R.id.tvMessage);
        image = findViewById(R.id.imgProduct);

        ProductRepository repo = new ProductRepository(this);
        ProductGridAdapter similar = new ProductGridAdapter();
        
        RecyclerView rvSimilar = findViewById(R.id.rvSimilar);
        rvSimilar.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        rvSimilar.setAdapter(similar);
        
        // Quantity adjustment click events
        findViewById(R.id.btnDecrement).setOnClickListener(v -> {
            if (quantity > 1) {
                quantity--;
                tvQuantity.setText(String.valueOf(quantity));
            }
        });
        
        findViewById(R.id.btnIncrement).setOnClickListener(v -> {
            if (product != null) {
                int maxStock = product.quantity != null ? product.quantity : 1;
                if (quantity < maxStock) {
                    quantity++;
                    tvQuantity.setText(String.valueOf(quantity));
                } else {
                    ToastUtils.show(this, "Đã đạt giới hạn tồn kho");
                }
            }
        });

        findViewById(R.id.btnAddCart).setOnClickListener(v -> {
            if (requireLogin()) {
                new CartRepository(this).add(productId, quantity, new RepositoryCallback<CartMutationResponse>() {
                    @Override
                    public void onSuccess(CartMutationResponse data) {
                        Intent intent = new Intent(ProductDetailActivity.this, MainActivity.class);
                        intent.putExtra("select_tab", "cart");
                        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                        startActivity(intent);
                        finish();
                    }

                    @Override
                    public void onError(String m) {
                        ToastUtils.show(ProductDetailActivity.this, m);
                    }
                });
            }
        });
        
        findViewById(R.id.btnFavorite).setOnClickListener(v -> {
            if (requireLogin()) {
                new UserRepository(this).favorite(productId, toastCallback("Đã cập nhật yêu thích"));
            }
        });

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());
        
        repo.detail(productId, new RepositoryCallback<ProductDetailResponse>() {
            public void onSuccess(ProductDetailResponse d) {
                product = d.data;
                bind();
            }
            public void onError(String m) {
                msg.setText(m);
            }
        });
        
        repo.similar(productId, new RepositoryCallback<List<Product>>() {
            public void onSuccess(List<Product> d) {
                similar.submit(d);
            }
            public void onError(String m) {}
        });

        if (session().isLoggedIn()) {
            new UserRepository(this).viewed(productId, new RepositoryCallback<SimpleResponse>() {
                public void onSuccess(SimpleResponse d) {}
                public void onError(String m) {}
            });
        }
    }

    private <T> RepositoryCallback<T> toastCallback(String ok) {
        return new RepositoryCallback<T>() {
            public void onSuccess(T d) {
                ToastUtils.show(ProductDetailActivity.this, ok);
            }
            public void onError(String m) {
                ToastUtils.show(ProductDetailActivity.this, m);
            }
        };
    }

    private void bind() {
        if (product == null) return;
        name.setText(product.name);
        
        // Handle discount pricing logic
        if (product.discount != null && product.discount > 0) {
            double discountedPrice = product.price * (1 - product.discount / 100.0);
            price.setText(CurrencyUtils.formatVnd(discountedPrice));
            
            tvOriginalPrice.setText(CurrencyUtils.formatVnd(product.price));
            tvOriginalPrice.setPaintFlags(tvOriginalPrice.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
            tvOriginalPrice.setVisibility(View.VISIBLE);
            
            tvDiscountBadge.setText("-" + product.discount + "%");
            tvDiscountBadge.setVisibility(View.VISIBLE);
        } else {
            price.setText(CurrencyUtils.formatVnd(product.price));
            tvOriginalPrice.setVisibility(View.GONE);
            tvDiscountBadge.setVisibility(View.GONE);
        }
        
        // Category and Stock Info
        if (product.category != null) {
            if (product.category.isJsonObject()) {
                try {
                    String catName = product.category.getAsJsonObject().get("name").getAsString();
                    tvCategory.setText(catName);
                } catch (Exception e) {
                    tvCategory.setText("PTIT Shop");
                }
            } else {
                tvCategory.setText(product.category.getAsString());
            }
        } else {
            tvCategory.setText("PTIT Shop");
        }
        
        tvStock.setText(safe(product.quantity));
        
        meta.setText("Đã bán: " + safe(product.sold) + " | Lượt xem: " + safe(product.views));
        desc.setText(product.description == null ? "" : product.description);
        ImageUtils.load(image, product.firstImageUrl());
    }

    private String safe(Object o) {
        return o == null ? "0" : String.valueOf(o);
    }
}
