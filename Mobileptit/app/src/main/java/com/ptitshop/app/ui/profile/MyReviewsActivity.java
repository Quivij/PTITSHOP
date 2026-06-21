package com.ptitshop.app.ui.profile;

import android.os.Bundle;
import android.widget.TextView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.data.remote.dto.response.ReviewListResponse;
import com.ptitshop.app.repository.RepositoryCallback;
import com.ptitshop.app.repository.ReviewRepository;
import com.ptitshop.app.ui.product.adapter.ReviewAdapter;

public class MyReviewsActivity extends BaseActivity {
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_my_reviews);
        TextView msg = findViewById(R.id.tvMessage);
        ReviewAdapter adapter = new ReviewAdapter();
        RecyclerView rv = findViewById(R.id.rvReviews);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(adapter);
        new ReviewRepository(this).mine(new RepositoryCallback<ReviewListResponse>() {
            public void onSuccess(ReviewListResponse d) {
                adapter.submit(d.data);
                msg.setText(d.data == null || d.data.isEmpty() ? "Chua co danh gia" : "");
            }
            public void onError(String m) { msg.setText(m); }
        });
    }
}
