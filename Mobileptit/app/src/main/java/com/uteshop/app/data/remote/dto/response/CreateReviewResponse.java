package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;
import com.uteshop.app.data.model.Review;

public class CreateReviewResponse extends BaseResponse {
    public Review data;
    public Reward reward;
    public static class Reward {
        public String type, code, discountType, expiryDate;
        public Double discountValue;
        public Integer amount;
    }
}
