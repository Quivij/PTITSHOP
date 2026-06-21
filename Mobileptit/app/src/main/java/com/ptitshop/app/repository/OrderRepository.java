package com.ptitshop.app.repository;

import android.content.Context;
import com.ptitshop.app.core.network.RetrofitClient;
import com.ptitshop.app.data.remote.api.*;
import com.ptitshop.app.data.remote.dto.request.*;
import com.ptitshop.app.data.remote.dto.response.*;

public class OrderRepository extends BaseRepository {
    OrderApi api;
    public OrderRepository(Context c) {
        api=RetrofitClient.create(c, OrderApi.class);
    }
    public void orders(String s, RepositoryCallback<OrderListResponse>cb) {
        enqueue(api.getOrders(s), cb);
    }
    public void updateStatus(String id, String current, RepositoryCallback<OrderUpdateResponse>cb) {
        enqueue(api.updateOrderStatus(id, new UpdateOrderStatusRequest(current)), cb);
    }
}
