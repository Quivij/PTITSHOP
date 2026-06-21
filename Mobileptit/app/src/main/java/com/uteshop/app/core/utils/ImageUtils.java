package com.uteshop.app.core.utils;

import android.widget.ImageView;
import com.bumptech.glide.Glide;
import com.uteshop.app.R;

public final class ImageUtils {
    private ImageUtils() {
    }
    public static void load(ImageView v, String url) {
        Glide.with(v).load(url).placeholder(R.drawable.bg_card).error(R.drawable.bg_card).into(v);
    }
}
