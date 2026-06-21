package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import com.ptitshop.app.data.model.Voucher;
import java.util.List;

public class MyVoucherResponse extends BaseResponse {
    public List<Voucher>vouchers;
    public Integer xu;
}
