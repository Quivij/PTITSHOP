package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;
import com.uteshop.app.data.model.Order;
import java.util.List;

public class OrderListResponse extends BaseResponse {
    public Data data;
    public static class Data {
        public List<Order>orders;
    }
}
