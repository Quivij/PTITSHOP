package com.ptitshop.app.data.remote.dto.request;

public class UpdateOrderStatusRequest {
    public String statusOrder;
    public UpdateOrderStatusRequest(String statusOrder) {
        this.statusOrder=statusOrder;
    }
}
