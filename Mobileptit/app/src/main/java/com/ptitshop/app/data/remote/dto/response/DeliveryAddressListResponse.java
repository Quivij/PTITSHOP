package com.ptitshop.app.data.remote.dto.response;

import com.ptitshop.app.core.base.BaseResponse;
import com.ptitshop.app.data.model.DeliveryAddress;
import java.util.List;

public class DeliveryAddressListResponse extends BaseResponse {
    public List<DeliveryAddress>data;
}
