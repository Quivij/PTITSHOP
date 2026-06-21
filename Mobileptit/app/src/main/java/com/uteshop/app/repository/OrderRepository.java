package com.uteshop.app.repository;

import android.content.Context;
import com.uteshop.app.core.network.RetrofitClient;
import com.uteshop.app.data.remote.api.*;
import com.uteshop.app.data.remote.dto.request.*;
import com.uteshop.app.data.remote.dto.response.*;

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
