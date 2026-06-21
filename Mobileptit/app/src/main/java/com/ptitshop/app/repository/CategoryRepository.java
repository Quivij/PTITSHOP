package com.ptitshop.app.repository;

import android.content.Context;
import com.ptitshop.app.core.network.RetrofitClient;
import com.ptitshop.app.data.remote.api.*;
import com.ptitshop.app.data.remote.dto.request.*;
import com.ptitshop.app.data.remote.dto.response.*;

public class CategoryRepository extends BaseRepository {
    CategoryApi api;
    public CategoryRepository(Context c) {
        api=RetrofitClient.create(c, CategoryApi.class);
    }
    public void categories(RepositoryCallback<java.util.List<com.ptitshop.app.data.model.Category>>cb) {
        enqueue(api.getCategories(), cb);
    }
}
