package com.ptitshop.app.core.base;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.ptitshop.app.R;
import com.ptitshop.app.core.storage.SessionManager;
import com.ptitshop.app.ui.auth.LoginActivity;

public abstract class BaseActivity extends AppCompatActivity {
    protected SessionManager sessionManager;
    protected SessionManager session() {
        if(sessionManager==null)sessionManager=new SessionManager(this);
        return sessionManager;
    }
    protected boolean requireLogin() {
        if(!session().isLoggedIn()) {
            startActivity(new Intent(this, LoginActivity.class));
            return false;
        }
        return true;
    }

    @Override
    public void setContentView(int layoutResID) {
        super.setContentView(layoutResID);
        setupCommonViews();
    }

    @Override
    public void setContentView(View view) {
        super.setContentView(view);
        setupCommonViews();
    }

    @Override
    public void setContentView(View view, ViewGroup.LayoutParams params) {
        super.setContentView(view, params);
        setupCommonViews();
    }

    private void setupCommonViews() {
        // 1. Find if btnBack is already in the layout
        View btnBack = findViewById(R.id.btnBack);
        if (btnBack != null) {
            btnBack.setOnClickListener(v -> finish());
            return;
        }

        // 2. If no btnBack, check if we can inject a toolbar
        ViewGroup content = findViewById(android.R.id.content);
        if (content == null || content.getChildCount() == 0) return;
        
        View mainView = content.getChildAt(0);
        ViewGroup targetGroup = null;
        
        if (mainView instanceof LinearLayout) {
            LinearLayout ll = (LinearLayout) mainView;
            if (ll.getOrientation() == LinearLayout.VERTICAL) {
                targetGroup = ll;
            }
        } else if (mainView instanceof android.widget.ScrollView) {
            android.widget.ScrollView sv = (android.widget.ScrollView) mainView;
            if (sv.getChildCount() > 0 && sv.getChildAt(0) instanceof LinearLayout) {
                LinearLayout ll = (LinearLayout) sv.getChildAt(0);
                if (ll.getOrientation() == LinearLayout.VERTICAL) {
                    targetGroup = ll;
                }
            }
        }
        
        if (targetGroup != null && targetGroup.getChildCount() > 0) {
            View firstChild = targetGroup.getChildAt(0);
            if (firstChild instanceof TextView) {
                TextView titleTv = (TextView) firstChild;
                CharSequence titleText = titleTv.getText();
                
                if (titleText != null && titleText.length() > 0) {
                    // Create toolbar
                    LinearLayout header = new LinearLayout(this);
                    header.setOrientation(LinearLayout.HORIZONTAL);
                    header.setGravity(android.view.Gravity.CENTER_VERTICAL);
                    
                    int heightPx = (int) (56 * getResources().getDisplayMetrics().density);
                    int paddingPx = (int) (16 * getResources().getDisplayMetrics().density);
                    
                    header.setLayoutParams(new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        heightPx
                    ));
                    header.setBackgroundColor(android.graphics.Color.WHITE);
                    header.setElevation(4f * getResources().getDisplayMetrics().density);
                    header.setPadding(paddingPx, 0, paddingPx, 0);
                    
                    // Create Back Button
                    ImageButton backBtn = new ImageButton(this);
                    int btnSize = (int) (40 * getResources().getDisplayMetrics().density);
                    LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(btnSize, btnSize);
                    backBtn.setLayoutParams(btnParams);
                    
                    // Ripple effect background
                    android.util.TypedValue outValue = new android.util.TypedValue();
                    getTheme().resolveAttribute(android.R.attr.selectableItemBackgroundBorderless, outValue, true);
                    backBtn.setBackgroundResource(outValue.resourceId);
                    
                    backBtn.setImageResource(R.drawable.ic_back);
                    backBtn.setContentDescription("Back");
                    backBtn.setOnClickListener(v -> finish());
                    
                    // Title TextView
                    TextView headerTitle = new TextView(this);
                    LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    );
                    titleParams.setMarginStart((int) (16 * getResources().getDisplayMetrics().density));
                    headerTitle.setLayoutParams(titleParams);
                    headerTitle.setText(titleText);
                    headerTitle.setTextSize(18);
                    headerTitle.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
                    headerTitle.setTextColor(getResources().getColor(R.color.colorTextPrimary));
                    
                    header.addView(backBtn);
                    header.addView(headerTitle);
                    
                    targetGroup.removeViewAt(0);
                    
                    if (targetGroup == mainView) {
                        int padL = targetGroup.getPaddingLeft();
                        int padT = targetGroup.getPaddingTop();
                        int padR = targetGroup.getPaddingRight();
                        int padB = targetGroup.getPaddingBottom();
                        
                        targetGroup.setPadding(0, 0, 0, 0);
                        
                        LinearLayout contentContainer = new LinearLayout(this);
                        contentContainer.setOrientation(LinearLayout.VERTICAL);
                        contentContainer.setLayoutParams(new LinearLayout.LayoutParams(
                            LinearLayout.LayoutParams.MATCH_PARENT,
                            LinearLayout.LayoutParams.MATCH_PARENT
                        ));
                        contentContainer.setPadding(padL, padT, padR, padB);
                        
                        java.util.List<View> otherViews = new java.util.ArrayList<>();
                        for (int i = 0; i < targetGroup.getChildCount(); i++) {
                            otherViews.add(targetGroup.getChildAt(i));
                        }
                        targetGroup.removeAllViews();
                        for (View v : otherViews) {
                            contentContainer.addView(v);
                        }
                        
                        targetGroup.addView(header, 0);
                        targetGroup.addView(contentContainer, 1);
                    } else {
                        targetGroup.addView(header, 0);
                    }
                }
            }
        }
    }
}
