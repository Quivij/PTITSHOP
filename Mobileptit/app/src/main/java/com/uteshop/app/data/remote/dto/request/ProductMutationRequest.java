package com.uteshop.app.data.remote.dto.request;

public class ProductMutationRequest {
    public String name, description, category;
    public Double price, discount;
    public Integer quantity;
    public java.util.List<com.uteshop.app.data.model.ProductImage>images;
}
