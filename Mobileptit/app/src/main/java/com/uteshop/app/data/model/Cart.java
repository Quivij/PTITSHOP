package com.uteshop.app.data.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Cart {
    @SerializedName("_id")public String id;
    public String user;
    public List<CartItem>items;
    public String createdAt;
    public String updatedAt;
}
