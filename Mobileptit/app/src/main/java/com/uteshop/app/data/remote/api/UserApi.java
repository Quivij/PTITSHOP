package com.uteshop.app.data.remote.api;

import com.uteshop.app.data.remote.dto.request.*;
import com.uteshop.app.data.remote.dto.response.*;
import retrofit2.Call;
import retrofit2.http.*;

public interface UserApi {
    @GET("v1/api/profile")
    Call<ProfileResponse> getProfile();

    @PUT("v1/api/update-profile")
    Call<ProfileUpdateResponse> updateProfile(@Body UpdateProfileRequest r);

    @POST("v1/api/user/viewed-products")
    Call<SimpleResponse> addViewedProduct(@Body ProductIdRequest r);

    @POST("v1/api/user/favorite-products")
    Call<ToggleFavoriteResponse> toggleFavoriteProduct(@Body ProductIdRequest r);
}
