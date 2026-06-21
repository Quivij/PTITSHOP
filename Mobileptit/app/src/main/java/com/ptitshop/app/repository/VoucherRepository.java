package com.ptitshop.app.repository;

import android.content.Context;
import com.ptitshop.app.core.network.RetrofitClient;
import com.ptitshop.app.data.remote.api.*;
import com.ptitshop.app.data.remote.dto.request.*;
import com.ptitshop.app.data.remote.dto.response.*;

public class VoucherRepository extends BaseRepository {
    VoucherApi api;
    public VoucherRepository(Context c) {
        api=RetrofitClient.create(c, VoucherApi.class);
    }
    public void mine(RepositoryCallback<MyVoucherResponse>cb) {
        enqueue(api.getMyVouchers(), cb);
    }
}
