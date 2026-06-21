package com.uteshop.app.data.remote.api;

import com.uteshop.app.data.remote.dto.response.MyVoucherResponse;
import retrofit2.Call;
import retrofit2.http.GET;

public interface VoucherApi {
    @GET("v1/api/voucher/my")
    Call<MyVoucherResponse> getMyVouchers();
}
