package com.uteshop.app.data.remote.dto.request;

public class AddToCartRequest {
    public String productId;
    public Integer quantity;
    public AddToCartRequest(String productId, Integer quantity) {
        this.productId=productId;
        this.quantity=quantity;
    }
}
