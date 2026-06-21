package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import com.ptitshop.app.data.model.User;
import java.util.List;

public class AdminUserListResponse extends BaseResponse {
    public List<User>data;
    public ProductListResponse.Pagination pagination;
}
