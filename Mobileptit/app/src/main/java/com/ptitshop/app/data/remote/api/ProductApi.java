package com.ptitshop.app.data.remote.api;

import com.ptitshop.app.data.model.Product;
import com.ptitshop.app.data.remote.dto.response.*;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.*;

public interface ProductApi {
    @GET("v1/api/products")
    Call<ProductListResponse> getProducts(@Query("page") int page, @Query("limit") int limit, @Query("category") String category, @Query("keyword") String keyword);

    @GET("v1/api/products/{id}")
    Call<ProductDetailResponse> getProductDetail(@Path("id") String id);

    @GET("v1/api/products/{id}/similar")
    Call<List<Product>> getSimilarProducts(@Path("id") String id);

    @GET("v1/api/products/top-viewed")
    Call<List<Product>> getTopViewedProducts();

    @GET("v1/api/products/top-discount")
    Call<List<Product>> getTopDiscountProducts();

    @GET("v1/api/newest")
    Call<List<Product>> getNewestProducts();

    @GET("v1/api/best-sellers")
    Call<List<Product>> getBestSellers(@Query("limit") int limit);
}
