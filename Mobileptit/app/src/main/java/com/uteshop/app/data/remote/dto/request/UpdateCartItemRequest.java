package com.uteshop.app.data.remote.dto.request;

public class UpdateCartItemRequest {
    public String productId;
    public Integer quantity;
    public UpdateCartItemRequest(String productId, Integer quantity) {
        this.productId=productId;
        this.quantity=quantity;
    }
}
