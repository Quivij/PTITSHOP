package com.uteshop.app.data.remote.api;

import com.uteshop.app.data.model.Category;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.*;

public interface CategoryApi {
    @GET("v1/api/categories")
    Call<List<Category>> getCategories();

    @GET("v1/api/categories/{slug}-{id}")
    Call<Category> getCategoryDetail(@Path("slug") String slug, @Path("id") String id);
}
