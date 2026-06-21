package com.uteshop.app.data.remote.api;

import com.uteshop.app.data.remote.dto.request.CreateReviewRequest;
import com.uteshop.app.data.remote.dto.response.*;
import retrofit2.Call;
import retrofit2.http.*;

public interface ReviewApi {
    @GET("v1/api/products/{productId}/reviews")
    Call<ReviewListResponse> getReviewsByProduct(@Path("productId") String productId);

    @GET("v1/api/reviews")
    Call<ReviewListResponse> getMyReviews();

    @POST("v1/api/reviews")
    Call<CreateReviewResponse> createReview(@Body CreateReviewRequest r);
}
