package com.uteshop.app.data.model;

import com.google.gson.JsonElement;
import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Product {
    @SerializedName("_id")public String id;
    public String name;
    public Integer quantity;
    public Integer sold;
    public String description;
    public Double price;
    public Double discount;
    public JsonElement category;
    public Integer views;
    public List<ProductImage>images;
    public String slug;
    public String status;
    public Boolean isNew;
    public Boolean isHot;
    public Integer stock;
    public String createdAt;
    public String updatedAt;
    public String avgRating;
    public List<Review>reviews;
    public Double discountAmount;
    public String firstImageUrl() {
        return images==null||images.isEmpty()?null:images.get(0).url;
    }
}
