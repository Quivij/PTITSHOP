package com.uteshop.app.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.uteshop.app.R;
import com.uteshop.app.core.base.BaseFragment;
import com.uteshop.app.data.remote.dto.response.ProfileResponse;
import com.uteshop.app.repository.RepositoryCallback;
import com.uteshop.app.repository.UserRepository;
import com.uteshop.app.ui.address.DeliveryAddressActivity;
import com.uteshop.app.ui.auth.LoginActivity;

public class ProfileFragment extends BaseFragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle b) {
        View v = inflater.inflate(R.layout.fragment_profile, container, false);
        TextView name = v.findViewById(R.id.tvName);
        TextView email = v.findViewById(R.id.tvEmail);
        TextView xu = v.findViewById(R.id.tvXu);
        name.setText(session().getFullName());
        email.setText(session().getEmail());
        xu.setText(session().getXu() + " xu");
        new UserRepository(requireContext()).profile(new RepositoryCallback<ProfileResponse>() {
            public void onSuccess(ProfileResponse d) {
                if (d.data != null) {
                    name.setText(d.data.fullName);
                    email.setText(d.data.email + " | " + d.data.username);
                    xu.setText((d.data.xu == null ? 0 : d.data.xu) + " xu");
                }
            }

            public void onError(String m) { }
        });
        v.findViewById(R.id.btnAddress).setOnClickListener(x -> startActivity(new Intent(requireContext(), DeliveryAddressActivity.class)));
        v.findViewById(R.id.btnEditProfile).setOnClickListener(x -> startActivity(new Intent(requireContext(), EditProfileActivity.class)));
        v.findViewById(R.id.btnVouchers).setOnClickListener(x -> startActivity(new Intent(requireContext(), MyVouchersActivity.class)));
        v.findViewById(R.id.btnReviews).setOnClickListener(x -> startActivity(new Intent(requireContext(), MyReviewsActivity.class)));
        v.findViewById(R.id.btnFavorites).setOnClickListener(x -> startActivity(new Intent(requireContext(), FavoriteProductsActivity.class)));
        v.findViewById(R.id.btnLogout).setOnClickListener(x -> {
            session().clear();
            startActivity(new Intent(requireContext(), LoginActivity.class));
        });
        return v;
    }
}
