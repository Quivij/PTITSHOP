package com.uteshop.app.data.model;

import com.google.gson.JsonElement;
import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Order {
    @SerializedName("_id")public String id;
    public JsonElement user;
    public java.util.List<OrderItem>items;
    public Double totalPrice;
    public String status;
    public String statusOrder;
    public Boolean isDelivered;
    public JsonElement paymentInfo;
    public String voucher;
    public Double discountAmount;
    public Integer usedXu;
    public JsonElement deliveryAddressId;
    public String autoUpdate;
    public String createdAt;
    public String updatedAt;
}
