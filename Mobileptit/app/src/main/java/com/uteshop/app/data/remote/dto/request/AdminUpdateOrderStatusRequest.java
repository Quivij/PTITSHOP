package com.uteshop.app.data.remote.dto.request;

public class AdminUpdateOrderStatusRequest {
    public String newStatusOrder;
    public AdminUpdateOrderStatusRequest(String newStatusOrder) {
        this.newStatusOrder=newStatusOrder;
    }
}
