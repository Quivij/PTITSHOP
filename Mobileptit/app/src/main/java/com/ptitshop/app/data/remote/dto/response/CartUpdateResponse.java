package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import com.ptitshop.app.data.model.Cart;

public class CartUpdateResponse extends BaseResponse {
    public Inner data;
    public static class Inner extends BaseResponse {
        public Integer status;
        public Cart data;
    }
}
