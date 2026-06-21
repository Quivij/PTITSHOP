package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;
import com.uteshop.app.data.model.Product;
import java.util.List;

public class ProductListResponse extends BaseResponse {
    public List<Product>data;
    public Pagination pagination;
    public static class Pagination {
        public Integer currentPage, page, limit, total, totalPages, totalProducts;
        public Boolean hasNextPage, hasPrevPage;
    }
}
