package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;

public class CartCountResponse extends BaseResponse {
    public Data data;
    public static class Data {
        public Integer count;
    }
}
