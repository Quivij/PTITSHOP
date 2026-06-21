package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;

public class OrderCountResponse extends BaseResponse {
    public Data data;
    public static class Data {
        public Integer count;
    }
}
