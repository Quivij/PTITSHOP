package com.uteshop.app.ui.home;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.uteshop.app.R;
import com.uteshop.app.core.base.BaseFragment;
import com.uteshop.app.core.constants.AppConstants;
import com.uteshop.app.data.model.Category;
import com.uteshop.app.data.model.Product;
import com.uteshop.app.data.remote.dto.response.ProductListResponse;
import com.uteshop.app.repository.CategoryRepository;
import com.uteshop.app.repository.ProductRepository;
import com.uteshop.app.repository.RepositoryCallback;
import com.uteshop.app.ui.home.adapter.CategoryAdapter;
import com.uteshop.app.ui.home.adapter.ProductHorizontalAdapter;
import com.uteshop.app.ui.product.ProductDetailActivity;
import com.uteshop.app.ui.product.ProductListActivity;
import java.util.ArrayList;
import java.util.List;

public class HomeFragment extends BaseFragment {
    private ProductRepository productRepo;
    private CategoryRepository categoryRepo;
    private TextView message;
    private SwipeRefreshLayout swipe;

    private CategoryAdapter catAdapter;
    private ProductHorizontalAdapter filteredAdapter;
    private View llNormalSections;
    private View rvFilteredProducts;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View v = inflater.inflate(R.layout.fragment_home, container, false);
        productRepo = new ProductRepository(requireContext());
        categoryRepo = new CategoryRepository(requireContext());
        message = v.findViewById(R.id.tvMessage);
        swipe = v.findViewById(R.id.swipeRefresh);

        llNormalSections = v.findViewById(R.id.llNormalSections);
        rvFilteredProducts = v.findViewById(R.id.rvFilteredProducts);

        // Filtered products list adapter and layout setup
        filteredAdapter = new ProductHorizontalAdapter();
        RecyclerView rvFiltered = (RecyclerView) rvFilteredProducts;
        rvFiltered.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvFiltered.setAdapter(filteredAdapter);
        filteredAdapter.setOnClick(p -> {
            Intent i = new Intent(requireContext(), ProductDetailActivity.class);
            i.putExtra(AppConstants.EXTRA_PRODUCT_ID, p.id);
            startActivity(i);
        });

        // Hero buttons
        v.findViewById(R.id.btnExplore).setOnClickListener(x -> {
            Intent i = new Intent(requireContext(), ProductListActivity.class);
            startActivity(i);
        });
        v.findViewById(R.id.btnLearnMore).setOnClickListener(x -> {
            // Scroll to features section or open about
        });

        // Search
        EditText search = v.findViewById(R.id.edtSearch);
        search.setOnEditorActionListener((tv, actionId, event) -> {
            openList(search.getText().toString().trim(), null);
            return true;
        });

        // Product sections
        setupProducts(v.findViewById(R.id.rvNewest), cb -> productRepo.newest(cb));
        setupProducts(v.findViewById(R.id.rvBestSellers), cb -> productRepo.bestSellers(cb));
        setupProducts(v.findViewById(R.id.rvTopDiscount), cb -> productRepo.topDiscount(cb));
        setupProducts(v.findViewById(R.id.rvTopViewed), cb -> productRepo.topViewed(cb));

        // Categories
        RecyclerView rvCat = v.findViewById(R.id.rvCategories);
        catAdapter = new CategoryAdapter();
        rvCat.setLayoutManager(new LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false));
        rvCat.setAdapter(catAdapter);

        // Handle category clicking/filtering
        catAdapter.setOnClick(c -> {
            if (catAdapter.getSelectedId().equals(c.id)) {
                // Deselect if already clicked
                catAdapter.setSelectedId("");
                rvFilteredProducts.setVisibility(View.GONE);
                llNormalSections.setVisibility(View.VISIBLE);
                message.setText("");
            } else {
                // Select category and load products
                catAdapter.setSelectedId(c.id);
                llNormalSections.setVisibility(View.GONE);
                rvFilteredProducts.setVisibility(View.VISIBLE);
                message.setText("Đang tải sản phẩm...");
                
                productRepo.products(1, 20, c.id, null, new RepositoryCallback<ProductListResponse>() {
                    @Override
                    public void onSuccess(ProductListResponse data) {
                        message.setText("");
                        if (data != null && data.data != null) {
                            filteredAdapter.submit(data.data);
                            if (data.data.isEmpty()) {
                                message.setText("Không có sản phẩm nào trong danh mục này.");
                            }
                        } else {
                            filteredAdapter.submit(new ArrayList<>());
                            message.setText("Không có sản phẩm nào.");
                        }
                    }

                    @Override
                    public void onError(String m) {
                        message.setText(m);
                        filteredAdapter.submit(new ArrayList<>());
                    }
                });
            }
        });

        // Newsletter
        v.findViewById(R.id.btnSubscribe).setOnClickListener(x -> {
            EditText emailInput = v.findViewById(R.id.edtNewsletterEmail);
            String email = emailInput.getText().toString().trim();
            if (!email.isEmpty()) {
                emailInput.setText("");
                message.setText("Cảm ơn bạn đã đăng ký!");
            }
        });

        swipe.setOnRefreshListener(() -> loadAll(v));
        loadAll(v);
        return v;
    }

    private interface ProductLoader { void load(RepositoryCallback<List<Product>> cb); }

    private void setupProducts(RecyclerView rv, ProductLoader loader) {
        ProductHorizontalAdapter adapter = new ProductHorizontalAdapter();
        adapter.setOnClick(p -> {
            Intent i = new Intent(requireContext(), ProductDetailActivity.class);
            i.putExtra(AppConstants.EXTRA_PRODUCT_ID, p.id);
            startActivity(i);
        });
        rv.setLayoutManager(new LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false));
        rv.setAdapter(adapter);
        rv.setTag(new Object[]{adapter, loader});
    }

    private void loadAll(View root) {
        swipe.setRefreshing(true);
        loadProducts((RecyclerView) root.findViewById(R.id.rvNewest));
        loadProducts((RecyclerView) root.findViewById(R.id.rvBestSellers));
        loadProducts((RecyclerView) root.findViewById(R.id.rvTopDiscount));
        loadProducts((RecyclerView) root.findViewById(R.id.rvTopViewed));

        // Load categories list
        categoryRepo.categories(new RepositoryCallback<List<Category>>() {
            public void onSuccess(List<Category> data) { 
                catAdapter.submit(data); 
                swipe.setRefreshing(false);
            }
            public void onError(String m) { 
                message.setText(m); 
                swipe.setRefreshing(false);
            }
        });

        // If a category is selected, also reload its products
        String selectedId = catAdapter.getSelectedId();
        if (!selectedId.isEmpty()) {
            productRepo.products(1, 20, selectedId, null, new RepositoryCallback<ProductListResponse>() {
                public void onSuccess(ProductListResponse data) {
                    if (data != null && data.data != null) {
                        filteredAdapter.submit(data.data);
                    }
                }
                public void onError(String m) { message.setText(m); }
            });
        }
    }

    @SuppressWarnings("unchecked")
    private void loadProducts(RecyclerView rv) {
        Object[] tag = (Object[]) rv.getTag();
        if (tag == null) return;
        ProductHorizontalAdapter adapter = (ProductHorizontalAdapter) tag[0];
        ProductLoader loader = (ProductLoader) tag[1];
        loader.load(new RepositoryCallback<List<Product>>() {
            public void onSuccess(List<Product> data) { adapter.submit(data); message.setText(""); }
            public void onError(String m) { message.setText(m); }
        });
    }

    private void openList(String keyword, String category) {
        Intent i = new Intent(requireContext(), ProductListActivity.class);
        i.putExtra(AppConstants.EXTRA_KEYWORD, keyword);
        i.putExtra(AppConstants.EXTRA_CATEGORY, category);
        startActivity(i);
    }
}
