package com.uteshop.app.repository;

import android.content.Context;
import com.uteshop.app.core.network.RetrofitClient;
import com.uteshop.app.data.remote.api.DeliveryAddressApi;
import com.uteshop.app.data.remote.dto.request.DeliveryAddressRequest;
import com.uteshop.app.data.remote.dto.response.DeliveryAddressListResponse;
import com.uteshop.app.data.remote.dto.response.DeliveryAddressResponse;

public class DeliveryAddressRepository extends BaseRepository {
    private final DeliveryAddressApi api;

    public DeliveryAddressRepository(Context c) {
        api = RetrofitClient.create(c, DeliveryAddressApi.class);
    }

    public void list(RepositoryCallback<DeliveryAddressListResponse> cb) {
        enqueue(api.getAddresses(), cb);
    }

    public void create(DeliveryAddressRequest r, RepositoryCallback<DeliveryAddressResponse> cb) {
        enqueue(api.createAddress(r), cb);
    }

    public void update(String id, DeliveryAddressRequest r, RepositoryCallback<DeliveryAddressResponse> cb) {
        enqueue(api.updateAddress(id, r), cb);
    }

    public void setDefault(String id, RepositoryCallback<DeliveryAddressResponse> cb) {
        enqueue(api.setDefault(id), cb);
    }

    public void delete(String id, RepositoryCallback<DeliveryAddressResponse> cb) {
        enqueue(api.deleteAddress(id), cb);
    }
}
