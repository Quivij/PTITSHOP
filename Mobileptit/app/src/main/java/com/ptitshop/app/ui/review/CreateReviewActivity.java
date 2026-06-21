package com.ptitshop.app.ui.review;

import android.os.Bundle;
import android.widget.*;
import com.ptitshop.app.R;
import com.ptitshop.app.core.base.BaseActivity;
import com.ptitshop.app.data.remote.dto.request.CreateReviewRequest;
import com.ptitshop.app.data.remote.dto.response.CreateReviewResponse;
import com.ptitshop.app.repository.RepositoryCallback;
import com.ptitshop.app.repository.ReviewRepository;

public class CreateReviewActivity extends BaseActivity {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(R.layout.activity_create_review);
        EditText order = findViewById(R.id.edtOrderId), product = findViewById(R.id.edtProductId), comment = findViewById(R.id.edtComment);
        RatingBar rating = findViewById(R.id.ratingBar);
        TextView msg = findViewById(R.id.tvMessage);
        findViewById(R.id.btnSubmit).setOnClickListener(v -> {
            CreateReviewRequest r = new CreateReviewRequest();
            r.orderId = order.getText().toString(); r.productId = product.getText().toString(); r.rating = (int) rating.getRating(); r.comment = comment.getText().toString();
            new ReviewRepository(this).create(r, new RepositoryCallback<CreateReviewResponse>() { public void onSuccess(CreateReviewResponse d){ msg.setText("Đã gửi đánh giá"); } public void onError(String m){ msg.setText(m); } });
        });
    }
}
