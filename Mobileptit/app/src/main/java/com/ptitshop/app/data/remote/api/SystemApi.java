package com.ptitshop.app.data.remote.api;

import com.ptitshop.app.data.remote.dto.response.SimpleResponse;
import retrofit2.Call;
import retrofit2.http.GET;

public interface SystemApi {
    @GET("v1/api/")
    Call<SimpleResponse> root();
}
