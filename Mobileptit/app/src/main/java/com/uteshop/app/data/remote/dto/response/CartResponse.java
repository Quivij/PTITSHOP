package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;
import com.uteshop.app.data.model.CartItem;
import java.util.List;

public class CartResponse extends BaseResponse {
    public Data data;
    public static class Data {
        public List<CartItem>items;
        public Integer totalItems;
        public Double totalPrice;
    }
}
