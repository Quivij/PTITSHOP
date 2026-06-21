package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import com.ptitshop.app.data.model.Review;

public class CreateReviewResponse extends BaseResponse {
    public Review data;
    public Reward reward;
    public static class Reward {
        public String type, code, discountType, expiryDate;
        public Double discountValue;
        public Integer amount;
    }
}
