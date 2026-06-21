package com.ptitshop.app.ui.product;

import android.content.Intent;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.TextView;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.core.constants.AppConstants;
import com.ptitshop.app.data.remote.dto.response.ProductListResponse;
import com.ptitshop.app.repository.ProductRepository;
import com.ptitshop.app.repository.RepositoryCallback;
import com.ptitshop.app.ui.product.adapter.ProductGridAdapter;

public class ProductListActivity extends BaseActivity {
    private ProductRepository repo;
    private ProductGridAdapter adapter;
    private TextView message;
    private SwipeRefreshLayout swipe;
    private String category;
    private String keyword;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_product_list);
        repo = new ProductRepository(this);
        category = getIntent().getStringExtra(AppConstants.EXTRA_CATEGORY);
        keyword = getIntent().getStringExtra(AppConstants.EXTRA_KEYWORD);
        message = findViewById(R.id.tvMessage);
        swipe = findViewById(R.id.swipeRefresh);
        EditText search = findViewById(R.id.edtSearch);
        search.setText(keyword == null ? "" : keyword);
        RecyclerView rv = findViewById(R.id.rvProducts);
        adapter = new ProductGridAdapter();
        adapter.setOnClick(p -> startActivity(new Intent(this, ProductDetailActivity.class).putExtra(AppConstants.EXTRA_PRODUCT_ID, p.id)));
        rv.setLayoutManager(new GridLayoutManager(this, 2));
        rv.setAdapter(adapter);
        findViewById(R.id.btnBack).setOnClickListener(v -> finish());
        search.setOnEditorActionListener((tv, actionId, event) -> { keyword = search.getText().toString().trim(); load(); return true; });
        swipe.setOnRefreshListener(this::load);
        load();
    }

    private void load() {
        swipe.setRefreshing(true);
        repo.products(1, AppConstants.PAGE_SIZE, category, keyword, new RepositoryCallback<ProductListResponse>() {
            public void onSuccess(ProductListResponse data) {
                swipe.setRefreshing(false);
                adapter.submit(data.data);
                message.setText(data.data == null || data.data.isEmpty() ? "Không có sản phẩm" : "");
            }
            public void onError(String m) { swipe.setRefreshing(false); message.setText(m); }
        });
    }
}
