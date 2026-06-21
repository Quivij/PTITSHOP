package com.ptitshop.app.repository;

import android.content.Context;
import com.ptitshop.app.core.network.RetrofitClient;
import com.ptitshop.app.data.remote.api.UserApi;
import com.ptitshop.app.data.remote.dto.request.ProductIdRequest;
import com.ptitshop.app.data.remote.dto.request.UpdateProfileRequest;
import com.ptitshop.app.data.remote.dto.response.ProfileResponse;
import com.ptitshop.app.data.remote.dto.response.ProfileUpdateResponse;
import com.ptitshop.app.data.remote.dto.response.SimpleResponse;
import com.ptitshop.app.data.remote.dto.response.ToggleFavoriteResponse;

public class UserRepository extends BaseRepository {
    private final UserApi api;

    public UserRepository(Context c) {
        api = RetrofitClient.create(c, UserApi.class);
    }

    public void profile(RepositoryCallback<ProfileResponse> cb) {
        enqueue(api.getProfile(), cb);
    }

    public void update(UpdateProfileRequest request, RepositoryCallback<ProfileUpdateResponse> cb) {
        enqueue(api.updateProfile(request), cb);
    }

    public void viewed(String id, RepositoryCallback<SimpleResponse> cb) {
        enqueue(api.addViewedProduct(new ProductIdRequest(id)), cb);
    }

    public void favorite(String id, RepositoryCallback<ToggleFavoriteResponse> cb) {
        enqueue(api.toggleFavoriteProduct(new ProductIdRequest(id)), cb);
    }
}
