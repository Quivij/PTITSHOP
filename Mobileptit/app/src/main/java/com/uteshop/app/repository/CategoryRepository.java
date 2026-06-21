package com.uteshop.app.repository;

import android.content.Context;
import com.uteshop.app.core.network.RetrofitClient;
import com.uteshop.app.data.remote.api.*;
import com.uteshop.app.data.remote.dto.request.*;
import com.uteshop.app.data.remote.dto.response.*;

public class CategoryRepository extends BaseRepository {
    CategoryApi api;
    public CategoryRepository(Context c) {
        api=RetrofitClient.create(c, CategoryApi.class);
    }
    public void categories(RepositoryCallback<java.util.List<com.uteshop.app.data.model.Category>>cb) {
        enqueue(api.getCategories(), cb);
    }
}
