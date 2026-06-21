package com.uteshop.app.repository;

import android.content.Context;
import com.uteshop.app.core.network.RetrofitClient;
import com.uteshop.app.data.model.Product;
import com.uteshop.app.data.remote.api.ProductApi;
import com.uteshop.app.data.remote.dto.response.ProductDetailResponse;
import com.uteshop.app.data.remote.dto.response.ProductListResponse;
import java.util.List;

public class ProductRepository extends BaseRepository {
    private final ProductApi api;

    public ProductRepository(Context c) {
        api = RetrofitClient.create(c, ProductApi.class);
    }

    public void products(int p, int l, String cat, String kw, RepositoryCallback<ProductListResponse> cb) {
        enqueue(api.getProducts(p, l, cat, kw), cb);
    }

    public void detail(String id, RepositoryCallback<ProductDetailResponse> cb) {
        enqueue(api.getProductDetail(id), cb);
    }

    public void similar(String id, RepositoryCallback<List<Product>> cb) {
        enqueue(api.getSimilarProducts(id), cb);
    }

    public void newest(RepositoryCallback<List<Product>> cb) {
        enqueue(api.getNewestProducts(), cb);
    }

    public void bestSellers(RepositoryCallback<List<Product>> cb) {
        enqueue(api.getBestSellers(6), cb);
    }

    public void topDiscount(RepositoryCallback<List<Product>> cb) {
        enqueue(api.getTopDiscountProducts(), cb);
    }

    public void topViewed(RepositoryCallback<List<Product>> cb) {
        enqueue(api.getTopViewedProducts(), cb);
    }
}
