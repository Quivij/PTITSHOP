package com.uteshop.app.repository;

import android.content.Context;
import com.uteshop.app.core.network.RetrofitClient;
import com.uteshop.app.data.remote.api.*;
import com.uteshop.app.data.remote.dto.request.*;
import com.uteshop.app.data.remote.dto.response.*;

public class PaymentRepository extends BaseRepository {
    PaymentApi api;
    public PaymentRepository(Context c) {
        api=RetrofitClient.create(c, PaymentApi.class);
    }
    public void create(CreatePaymentRequest r, RepositoryCallback<CreatePaymentResponse>cb) {
        enqueue(api.createPayment(r), cb);
    }
}
