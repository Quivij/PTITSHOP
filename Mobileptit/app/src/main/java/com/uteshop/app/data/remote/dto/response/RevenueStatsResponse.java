package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;
import java.util.List;

public class RevenueStatsResponse extends BaseResponse {
    public List<Item>data;
    public static class Item {
        public String date;
        public Double revenue;
        public Integer orders;
    }
}
