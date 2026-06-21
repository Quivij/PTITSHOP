package com.ptitshop.app.repository;

import android.content.Context;
import com.ptitshop.app.core.network.RetrofitClient;
import com.ptitshop.app.data.remote.api.*;
import com.ptitshop.app.data.remote.dto.request.*;
import com.ptitshop.app.data.remote.dto.response.*;

public class PaymentRepository extends BaseRepository {
    PaymentApi api;
    public PaymentRepository(Context c) {
        api=RetrofitClient.create(c, PaymentApi.class);
    }
    public void create(CreatePaymentRequest r, RepositoryCallback<CreatePaymentResponse>cb) {
        enqueue(api.createPayment(r), cb);
    }
}
