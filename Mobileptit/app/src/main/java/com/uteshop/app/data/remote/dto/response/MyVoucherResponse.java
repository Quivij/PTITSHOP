package com.uteshop.app.data.remote.dto.response;

import com.uteshop.app.core.base.BaseResponse;
import com.uteshop.app.data.model.Voucher;
import java.util.List;

public class MyVoucherResponse extends BaseResponse {
    public List<Voucher>vouchers;
    public Integer xu;
}
