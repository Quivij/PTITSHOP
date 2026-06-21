package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import com.ptitshop.app.data.model.Product;
import java.util.List;

public class ProductListResponse extends BaseResponse {
    public List<Product>data;
    public Pagination pagination;
    public static class Pagination {
        public Integer currentPage, page, limit, total, totalPages, totalProducts;
        public Boolean hasNextPage, hasPrevPage;
    }
}
