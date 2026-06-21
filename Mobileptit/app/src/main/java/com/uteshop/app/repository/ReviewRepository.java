package com.uteshop.app.repository;

import android.content.Context;
import com.uteshop.app.core.network.RetrofitClient;
import com.uteshop.app.data.remote.api.ReviewApi;
import com.uteshop.app.data.remote.dto.request.CreateReviewRequest;
import com.uteshop.app.data.remote.dto.response.CreateReviewResponse;
import com.uteshop.app.data.remote.dto.response.ReviewListResponse;

public class ReviewRepository extends BaseRepository {
    private final ReviewApi api;

    public ReviewRepository(Context c) {
        api = RetrofitClient.create(c, ReviewApi.class);
    }

    public void byProduct(String id, RepositoryCallback<ReviewListResponse> cb) {
        enqueue(api.getReviewsByProduct(id), cb);
    }

    public void mine(RepositoryCallback<ReviewListResponse> cb) {
        enqueue(api.getMyReviews(), cb);
    }

    public void create(CreateReviewRequest r, RepositoryCallback<CreateReviewResponse> cb) {
        enqueue(api.createReview(r), cb);
    }
}
