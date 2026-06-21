package com.uteshop.app.data.model;

import com.google.gson.JsonElement;
import com.google.gson.annotations.SerializedName;

public class Review {
    @SerializedName("_id")public String id;
    public JsonElement product;
    public JsonElement user;
    public Integer rating;
    public String comment;
    public String createdAt;
    public String updatedAt;
}
