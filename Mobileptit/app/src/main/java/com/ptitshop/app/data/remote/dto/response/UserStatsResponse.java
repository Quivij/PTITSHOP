package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import java.util.List;

public class UserStatsResponse extends BaseResponse {
    public List<Item>data;
    public static class Item {
        public String date;
        public Integer users;
    }
}
