package com.ptitshop.app.data.remote.dto.request;

public class LoginRequest {
    public String username;
    public String password;
    public LoginRequest(String username, String password) {
        this.username=username;
        this.password=password;
    }
}
