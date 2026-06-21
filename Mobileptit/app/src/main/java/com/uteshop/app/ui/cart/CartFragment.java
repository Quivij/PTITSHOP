package com.uteshop.app.ui.cart;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.uteshop.app.R;
import com.uteshop.app.core.base.BaseFragment;
import com.uteshop.app.core.utils.CurrencyUtils;
import com.uteshop.app.core.utils.ToastUtils;
import com.uteshop.app.data.model.CartItem;
import com.uteshop.app.data.remote.dto.response.CartMutationResponse;
import com.uteshop.app.data.remote.dto.response.CartResponse;
import com.uteshop.app.data.remote.dto.response.CartUpdateResponse;
import com.uteshop.app.repository.CartRepository;
import com.uteshop.app.repository.RepositoryCallback;
import com.uteshop.app.ui.cart.adapter.CartItemAdapter;
import com.uteshop.app.ui.checkout.CheckoutActivity;
import java.util.ArrayList;

public class CartFragment extends BaseFragment {
    private CartRepository repo;
    private CartItemAdapter adapter;
    private TextView total, msg;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle b) {
        View v = inflater.inflate(R.layout.fragment_cart, container, false);
        repo = new CartRepository(requireContext());
        adapter = new CartItemAdapter();
        total = v.findViewById(R.id.tvTotal);
        msg = v.findViewById(R.id.tvMessage);
        RecyclerView rv = v.findViewById(R.id.rvCart);
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        rv.setAdapter(adapter);
        adapter.setListener(new CartItemAdapter.Listener() {
            public void onPlus(CartItem item) { update(item, 1); }
            public void onMinus(CartItem item) { update(item, -1); }
            public void onRemove(CartItem item) { remove(item); }
            public void onSelectionChanged() { updateSelectionMessage(); }
        });
        v.findViewById(R.id.btnCheckout).setOnClickListener(x -> {
            ArrayList<String> ids = new ArrayList<>(adapter.getSelectedProductIds());
            if (ids.isEmpty()) {
                ToastUtils.show(requireContext(), "Chon san pham can thanh toan");
                return;
            }
            startActivity(new Intent(requireContext(), CheckoutActivity.class).putStringArrayListExtra("selectedProductIds", ids));
        });
        load();
        return v;
    }

    private void load() {
        repo.cart(new RepositoryCallback<CartResponse>() {
            public void onSuccess(CartResponse d) {
                if (d.data != null) {
                    adapter.submit(d.data.items);
                    total.setText("Tong: " + CurrencyUtils.formatVnd(d.data.totalPrice));
                    msg.setText(d.data.items == null || d.data.items.isEmpty() ? "Gio hang trong" : "Chon san pham de thanh toan");
                }
            }

            public void onError(String m) { msg.setText(m); }
        });
    }

    private void update(CartItem item, int delta) {
        if (item.product == null) return;
        repo.updateDelta(item.product.id, delta, new RepositoryCallback<CartUpdateResponse>() {
            public void onSuccess(CartUpdateResponse d) { load(); }
            public void onError(String m) { ToastUtils.show(requireContext(), m); }
        });
    }

    private void remove(CartItem item) {
        if (item.product == null) return;
        repo.remove(item.product.id, new RepositoryCallback<CartMutationResponse>() {
            public void onSuccess(CartMutationResponse d) { load(); }
            public void onError(String m) { ToastUtils.show(requireContext(), m); }
        });
    }

    private void updateSelectionMessage() {
        msg.setText("Da chon " + adapter.getSelectedProductIds().size() + " san pham");
    }
}
