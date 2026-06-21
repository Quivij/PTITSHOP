package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import com.ptitshop.app.data.model.Review;
import java.util.List;

public class ReviewListResponse extends BaseResponse {
    public Integer count;
    public List<Review>data;
}
