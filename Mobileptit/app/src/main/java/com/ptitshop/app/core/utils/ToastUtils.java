package com.ptitshop.app.core.utils;

import android.content.Context;
import android.widget.Toast;

public final class ToastUtils {
    private ToastUtils() {
    }
    public static void show(Context c, String m) {
        Toast.makeText(c, m==null?"Co loi xay ra":m, Toast.LENGTH_SHORT).show();
    }
}
