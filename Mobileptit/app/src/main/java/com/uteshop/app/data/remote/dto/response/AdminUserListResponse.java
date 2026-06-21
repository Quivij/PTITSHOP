package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;
import com.uteshop.app.data.model.User;
import java.util.List;

public class AdminUserListResponse extends BaseResponse {
    public List<User>data;
    public ProductListResponse.Pagination pagination;
}
