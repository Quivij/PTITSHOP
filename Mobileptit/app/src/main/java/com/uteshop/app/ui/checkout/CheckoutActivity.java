package com.uteshop.app.ui.checkout;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Spinner;
import android.widget.TextView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.uteshop.app.R;
import com.uteshop.app.core.base.BaseActivity;
import com.uteshop.app.core.utils.CurrencyUtils;
import com.uteshop.app.core.utils.ToastUtils;
import com.uteshop.app.data.model.CartItem;
import com.uteshop.app.data.model.DeliveryAddress;
import com.uteshop.app.data.model.Voucher;
import com.uteshop.app.data.remote.dto.request.CreatePaymentRequest;
import com.uteshop.app.data.remote.dto.response.CartResponse;
import com.uteshop.app.data.remote.dto.response.CreatePaymentResponse;
import com.uteshop.app.data.remote.dto.response.DeliveryAddressListResponse;
import com.uteshop.app.data.remote.dto.response.MyVoucherResponse;
import com.uteshop.app.repository.CartRepository;
import com.uteshop.app.repository.DeliveryAddressRepository;
import com.uteshop.app.repository.PaymentRepository;
import com.uteshop.app.repository.RepositoryCallback;
import com.uteshop.app.repository.VoucherRepository;
import com.uteshop.app.ui.address.DeliveryAddressActivity;
import com.uteshop.app.ui.checkout.adapter.CheckoutAddressAdapter;
import com.uteshop.app.ui.checkout.adapter.CheckoutItemAdapter;
import java.util.ArrayList;
import java.util.List;

public class CheckoutActivity extends BaseActivity {
    private CheckoutAddressAdapter addressAdapter;
    private CheckoutItemAdapter itemAdapter;
    private Spinner spVouchers;
    private CheckBox cbUseXu;
    private TextView tvAvailableXu;
    private RadioGroup rgPayment;
    private RadioButton rbCod, rbVnpay;
    private Button btnPay;
    private TextView tvTotalCheckoutPrice, tvNoAddress, tvMessage;

    private DeliveryAddressRepository addressRepo;
    private CartRepository cartRepo;
    private VoucherRepository voucherRepo;

    private ArrayList<String> selectedProductIds;
    private final List<Voucher> voucherList = new ArrayList<>();
    private final List<CartItem> selectedCartItems = new ArrayList<>();

    private double subTotal = 0;
    private double voucherDiscount = 0;
    private int availableXu = 0;
    private int usedXu = 0;
    private double finalPrice = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_checkout);

        addressRepo = new DeliveryAddressRepository(this);
        cartRepo = new CartRepository(this);
        voucherRepo = new VoucherRepository(this);

        selectedProductIds = getIntent().getStringArrayListExtra("selectedProductIds");
        if (selectedProductIds == null) {
            selectedProductIds = new ArrayList<>();
        }

        initViews();
        setupRecyclerViews();
        setupListeners();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadAddresses();
        loadCartItems();
        loadVouchersAndCoins();
    }

    private void initViews() {
        spVouchers = findViewById(R.id.spVouchers);
        cbUseXu = findViewById(R.id.cbUseXu);
        tvAvailableXu = findViewById(R.id.tvAvailableXu);
        rgPayment = findViewById(R.id.rgPayment);
        rbCod = findViewById(R.id.rbCod);
        rbVnpay = findViewById(R.id.rbVnpay);
        btnPay = findViewById(R.id.btnPay);
        tvTotalCheckoutPrice = findViewById(R.id.tvTotalCheckoutPrice);
        tvNoAddress = findViewById(R.id.tvNoAddress);
        tvMessage = findViewById(R.id.tvMessage);

        findViewById(R.id.btnManageAddress).setOnClickListener(v -> 
            startActivity(new Intent(this, DeliveryAddressActivity.class))
        );
    }

    private void setupRecyclerViews() {
        RecyclerView rvAddresses = findViewById(R.id.rvAddresses);
        rvAddresses.setLayoutManager(new LinearLayoutManager(this));
        addressAdapter = new CheckoutAddressAdapter();
        rvAddresses.setAdapter(addressAdapter);

        RecyclerView rvCheckoutItems = findViewById(R.id.rvCheckoutItems);
        rvCheckoutItems.setLayoutManager(new LinearLayoutManager(this));
        itemAdapter = new CheckoutItemAdapter();
        rvCheckoutItems.setAdapter(itemAdapter);
    }

    private void setupListeners() {
        spVouchers.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                calculateDiscountAndTotal();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        cbUseXu.setOnCheckedChangeListener((buttonView, isChecked) -> calculateDiscountAndTotal());

        rgPayment.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == R.id.rbCod) {
                btnPay.setText("Đặt hàng COD");
            } else {
                btnPay.setText("Thanh toán ngay");
            }
        });

        btnPay.setOnClickListener(v -> placeOrder());
    }

    private void loadAddresses() {
        addressRepo.list(new RepositoryCallback<DeliveryAddressListResponse>() {
            @Override
            public void onSuccess(DeliveryAddressListResponse response) {
                if (response.data != null && !response.data.isEmpty()) {
                    tvNoAddress.setVisibility(View.GONE);
                    addressAdapter.submit(response.data);
                } else {
                    tvNoAddress.setVisibility(View.VISIBLE);
                    addressAdapter.submit(new ArrayList<>());
                }
            }

            @Override
            public void onError(String message) {
                tvMessage.setText(message);
            }
        });
    }

    private void loadCartItems() {
        cartRepo.cart(new RepositoryCallback<CartResponse>() {
            @Override
            public void onSuccess(CartResponse response) {
                selectedCartItems.clear();
                if (response.data != null && response.data.items != null) {
                    for (CartItem item : response.data.items) {
                        if (item.product != null && selectedProductIds.contains(item.product.id)) {
                            selectedCartItems.add(item);
                        }
                    }
                }
                itemAdapter.submit(selectedCartItems);
                calculateSubtotal();
            }

            @Override
            public void onError(String message) {
                tvMessage.setText(message);
            }
        });
    }

    private void loadVouchersAndCoins() {
        voucherRepo.mine(new RepositoryCallback<MyVoucherResponse>() {
            @Override
            public void onSuccess(MyVoucherResponse response) {
                availableXu = response.xu != null ? response.xu : 0;
                tvAvailableXu.setText("(Có " + availableXu + " xu)");

                voucherList.clear();
                List<String> spinnerOptions = new ArrayList<>();
                spinnerOptions.add("Không sử dụng");

                if (response.vouchers != null) {
                    for (Voucher voucher : response.vouchers) {
                        voucherList.add(voucher);
                        String desc = voucher.code + " (Giảm " +
                            (voucher.type.equals("percentage") 
                                ? (voucher.discountValue.intValue() + "%") 
                                : CurrencyUtils.formatVnd(voucher.discountValue)) + ")";
                        spinnerOptions.add(desc);
                    }
                }

                ArrayAdapter<String> spinnerAdapter = new ArrayAdapter<>(
                    CheckoutActivity.this,
                    android.R.layout.simple_spinner_item,
                    spinnerOptions
                );
                spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                spVouchers.setAdapter(spinnerAdapter);
            }

            @Override
            public void onError(String message) {
                // Ignore coins/voucher load failure or log it gracefully
            }
        });
    }

    private void calculateSubtotal() {
        subTotal = 0;
        for (CartItem item : selectedCartItems) {
            double originalPrice = item.product.price;
            double discountPercent = item.product.discount != null ? item.product.discount : 0;
            double finalUnitPrice = originalPrice * (1.0 - (discountPercent / 100.0));
            subTotal += finalUnitPrice * item.quantity;
        }
        calculateDiscountAndTotal();
    }

    private void calculateDiscountAndTotal() {
        int selectedVoucherPos = spVouchers.getSelectedItemPosition();
        voucherDiscount = 0;

        if (selectedVoucherPos > 0 && selectedVoucherPos - 1 < voucherList.size()) {
            Voucher selectedVoucher = voucherList.get(selectedVoucherPos - 1);
            if (selectedVoucher.type.equals("percentage")) {
                voucherDiscount = (subTotal * selectedVoucher.discountValue) / 100.0;
            } else {
                voucherDiscount = selectedVoucher.discountValue;
            }
        }

        double remainingPrice = Math.max(0, subTotal - voucherDiscount);

        if (cbUseXu.isChecked()) {
            usedXu = Math.min(availableXu, (int) remainingPrice);
        } else {
            usedXu = 0;
        }

        finalPrice = Math.max(0, remainingPrice - usedXu);
        tvTotalCheckoutPrice.setText(CurrencyUtils.formatVnd(finalPrice));
    }

    private void placeOrder() {
        String selectedAddressId = addressAdapter.getSelectedAddressId();
        if (selectedAddressId == null || selectedAddressId.isEmpty()) {
            ToastUtils.show(this, "Vui lòng chọn địa chỉ giao hàng");
            return;
        }

        CreatePaymentRequest r = new CreatePaymentRequest();
        r.items = selectedProductIds;
        r.deliveryAddressId = selectedAddressId;
        
        int selectedVoucherPos = spVouchers.getSelectedItemPosition();
        if (selectedVoucherPos > 0 && selectedVoucherPos - 1 < voucherList.size()) {
            r.voucherCode = voucherList.get(selectedVoucherPos - 1).code;
        } else {
            r.voucherCode = null;
        }

        r.usedXu = usedXu;
        r.type = rbCod.isChecked() ? "cod" : "vnpay";

        btnPay.setEnabled(false);
        new PaymentRepository(this).create(r, new RepositoryCallback<CreatePaymentResponse>() {
            @Override
            public void onSuccess(CreatePaymentResponse d) {
                btnPay.setEnabled(true);
                if (d.url != null && !d.url.isEmpty()) {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(d.url)));
                    finish();
                } else {
                    startActivity(new Intent(CheckoutActivity.this, PaymentResultActivity.class)
                        .putExtra("orderId", d.orderId));
                    finish();
                }
            }

            @Override
            public void onError(String m) {
                btnPay.setEnabled(true);
                ToastUtils.show(CheckoutActivity.this, m);
                tvMessage.setText(m);
            }
        });
    }
}
