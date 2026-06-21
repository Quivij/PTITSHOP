package com.ptitshop.app.data.remote.dto.request;

public class ProductMutationRequest {
    public String name, description, category;
    public Double price, discount;
    public Integer quantity;
    public java.util.List<com.ptitshop.app.data.model.ProductImage>images;
}
