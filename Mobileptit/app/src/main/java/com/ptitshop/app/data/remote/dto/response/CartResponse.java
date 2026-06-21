package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import com.ptitshop.app.data.model.CartItem;
import java.util.List;

public class CartResponse extends BaseResponse {
    public Data data;
    public static class Data {
        public List<CartItem>items;
        public Integer totalItems;
        public Double totalPrice;
    }
}
