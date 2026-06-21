package com.uteshop.app.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.uteshop.app.R;
import com.uteshop.app.core.base.BaseActivity;
import com.uteshop.app.core.constants.AppConstants;
import com.uteshop.app.data.model.Product;
import com.uteshop.app.data.remote.dto.response.ProductDetailResponse;
import com.uteshop.app.data.remote.dto.response.ProfileResponse;
import com.uteshop.app.repository.ProductRepository;
import com.uteshop.app.repository.RepositoryCallback;
import com.uteshop.app.repository.UserRepository;
import com.uteshop.app.ui.product.ProductDetailActivity;
import com.uteshop.app.ui.product.adapter.ProductGridAdapter;
import java.util.ArrayList;
import java.util.List;

public class FavoriteProductsActivity extends BaseActivity {
    private ProductGridAdapter adapter;
    private TextView message;
    private final List<Product> products = new ArrayList<>();

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_favorite_products);
        message = findViewById(R.id.tvMessage);
        adapter = new ProductGridAdapter();
        adapter.setOnClick(p -> startActivity(new Intent(this, ProductDetailActivity.class).putExtra(AppConstants.EXTRA_PRODUCT_ID, p.id)));
        RecyclerView rv = findViewById(R.id.rvProducts);
        rv.setLayoutManager(new GridLayoutManager(this, 2));
        rv.setAdapter(adapter);
        loadFavorites();
    }

    private void loadFavorites() {
        new UserRepository(this).profile(new RepositoryCallback<ProfileResponse>() {
            public void onSuccess(ProfileResponse d) {
                if (d.data == null || d.data.favProducts == null || d.data.favProducts.isEmpty()) {
                    message.setText("Chua co san pham yeu thich");
                    return;
                }
                message.setText("Dang tai " + d.data.favProducts.size() + " san pham...");
                ProductRepository repo = new ProductRepository(FavoriteProductsActivity.this);
                products.clear();
                for (String id : d.data.favProducts) {
                    repo.detail(id, new RepositoryCallback<ProductDetailResponse>() {
                        public void onSuccess(ProductDetailResponse detail) {
                            if (detail.data != null) products.add(detail.data);
                            adapter.submit(products);
                            message.setText(products.isEmpty() ? "Chua tai duoc san pham" : "");
                        }
                        public void onError(String m) { message.setText(m); }
                    });
                }
            }

            public void onError(String m) { message.setText(m); }
        });
    }
}
