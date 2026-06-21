package com.uteshop.app.data.remote.dto.request;

public class ToggleUserActiveRequest {
    public Boolean isActive;
    public ToggleUserActiveRequest(Boolean isActive) {
        this.isActive=isActive;
    }
}
