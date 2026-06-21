package com.ptitshop.app.repository;

import android.content.Context;
import com.ptitshop.app.core.network.RetrofitClient;
import com.ptitshop.app.data.remote.api.*;
import com.ptitshop.app.data.remote.dto.request.*;
import com.ptitshop.app.data.remote.dto.response.*;

public class CartRepository extends BaseRepository {
    CartApi api;
    public CartRepository(Context c) {
        api=RetrofitClient.create(c, CartApi.class);
    }
    public void cart(RepositoryCallback<CartResponse>cb) {
        enqueue(api.getCart(), cb);
    }
    public void add(String id, int q, RepositoryCallback<CartMutationResponse>cb) {
        enqueue(api.addToCart(new AddToCartRequest(id, q)), cb);
    }
    public void updateDelta(String id, int q, RepositoryCallback<CartUpdateResponse>cb) {
        enqueue(api.updateCartItem(new UpdateCartItemRequest(id, q)), cb);
    }
    public void remove(String id, RepositoryCallback<CartMutationResponse>cb) {
        enqueue(api.removeFromCart(id), cb);
    }
}
