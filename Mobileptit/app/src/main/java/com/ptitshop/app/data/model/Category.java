package com.ptitshop.app.data.model;

import com.google.gson.annotations.SerializedName;

public class Category {
    @SerializedName("_id")public String id;
    public String name;
    public String description;
    public String slug;
    public String createdAt;
    public String updatedAt;
}
