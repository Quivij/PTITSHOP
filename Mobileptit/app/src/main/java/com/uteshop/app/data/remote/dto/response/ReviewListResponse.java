package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;
import com.uteshop.app.data.model.Review;
import java.util.List;

public class ReviewListResponse extends BaseResponse {
    public Integer count;
    public List<Review>data;
}
