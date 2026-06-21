package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import com.ptitshop.app.data.model.User;

public class LoginResponse extends BaseResponse {
    public Data data;
    public static class Data {
        public User user;
        public String accessToken;
        public String refreshToken;
    }
}
