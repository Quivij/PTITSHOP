package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;
import com.uteshop.app.data.model.Cart;

public class CartUpdateResponse extends BaseResponse {
    public Inner data;
    public static class Inner extends BaseResponse {
        public Integer status;
        public Cart data;
    }
}
