package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import com.ptitshop.app.data.model.Order;
import java.util.List;

public class OrderListResponse extends BaseResponse {
    public Data data;
    public static class Data {
        public List<Order>orders;
    }
}
