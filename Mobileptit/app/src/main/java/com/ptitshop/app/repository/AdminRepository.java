package com.ptitshop.app.repository;

import android.content.Context;
import com.ptitshop.app.core.network.RetrofitClient;
import com.ptitshop.app.data.remote.api.*;
import com.ptitshop.app.data.remote.dto.request.*;
import com.ptitshop.app.data.remote.dto.response.*;

public class AdminRepository extends BaseRepository {
    AdminApi api;
    public AdminRepository(Context c) {
        api=RetrofitClient.create(c, AdminApi.class);
    }
    public void products(RepositoryCallback<ProductListResponse>cb) {
        enqueue(api.getAdminProducts(1, 10, null, null), cb);
    }
    public void orders(String s, RepositoryCallback<OrderListResponse>cb) {
        enqueue(api.getAdminOrders(s), cb);
    }
}
