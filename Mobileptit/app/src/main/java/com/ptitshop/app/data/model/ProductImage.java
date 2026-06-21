package com.ptitshop.app.data.model;

import com.google.gson.annotations.SerializedName;

public class ProductImage {
    @SerializedName("_id")public String id;
    public String product;
    public String url;
    public String alt;
    public String createdAt;
    public String updatedAt;
}
