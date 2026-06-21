package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;
import com.uteshop.app.data.model.User;

public class LoginResponse extends BaseResponse {
    public Data data;
    public static class Data {
        public User user;
        public String accessToken;
        public String refreshToken;
    }
}
