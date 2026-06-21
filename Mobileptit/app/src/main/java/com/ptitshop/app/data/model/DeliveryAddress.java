package com.ptitshop.app.data.model;

import com.google.gson.annotations.SerializedName;

public class DeliveryAddress {
    @SerializedName("_id")public String id;
    public String addressName;
    public Boolean defaultAddress;
    public String nameBuyer;
    public String buyerId;
    public String phoneNumber;
    public String note;
    public String createdAt;
    public String updatedAt;
}
