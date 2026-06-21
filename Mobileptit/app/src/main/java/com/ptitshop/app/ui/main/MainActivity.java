package com.ptitshop.app.ui.main;

import android.content.Intent;
import android.os.Bundle;
import androidx.fragment.app.Fragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.ui.cart.CartFragment;
import com.ptitshop.app.ui.home.HomeFragment;
import com.ptitshop.app.ui.order.OrderFragment;
import com.ptitshop.app.ui.profile.ProfileFragment;

public class MainActivity extends BaseActivity {
    private BottomNavigationView nav;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_main);
        nav = findViewById(R.id.bottomNavigation);
        nav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.navHome) {
                show(new HomeFragment());
                return true;
            }
            if (id == R.id.navCart) {
                if (requireLogin()) show(new CartFragment());
                return true;
            }
            if (id == R.id.navOrders) {
                if (requireLogin()) show(new OrderFragment());
                return true;
            }
            if (id == R.id.navProfile) {
                if (requireLogin()) show(new ProfileFragment());
                return true;
            }
            return false;
        });

        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent != null && "cart".equals(intent.getStringExtra("select_tab"))) {
            if (nav != null) {
                nav.setSelectedItemId(R.id.navCart);
            }
        } else {
            if (getSupportFragmentManager().findFragmentById(R.id.fragmentContainer) == null) {
                show(new HomeFragment());
            }
        }
    }

    private void show(Fragment f) {
        getSupportFragmentManager().beginTransaction().replace(R.id.fragmentContainer, f).commit();
    }
}
