package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;

public class RefreshTokenResponse extends BaseResponse {
    public Data data;
    public static class Data {
        public String accessToken;
    }
}
