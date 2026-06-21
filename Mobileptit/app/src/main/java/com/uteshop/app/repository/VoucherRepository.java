package com.uteshop.app.repository;

import android.content.Context;
import com.uteshop.app.core.network.RetrofitClient;
import com.uteshop.app.data.remote.api.*;
import com.uteshop.app.data.remote.dto.request.*;
import com.uteshop.app.data.remote.dto.response.*;

public class VoucherRepository extends BaseRepository {
    VoucherApi api;
    public VoucherRepository(Context c) {
        api=RetrofitClient.create(c, VoucherApi.class);
    }
    public void mine(RepositoryCallback<MyVoucherResponse>cb) {
        enqueue(api.getMyVouchers(), cb);
    }
}
