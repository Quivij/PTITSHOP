package com.ptitshop.app.core.utils;

import java.text.NumberFormat;
import java.util.Locale;

public final class CurrencyUtils {
    private CurrencyUtils() {
    }
    public static String formatVnd(Number a) {
        return NumberFormat.getCurrencyInstance(new Locale("vi", "VN")).format(a==null?0:a);
    }
    public static double discounted(double p, double d) {
        return Math.max(0, p-d);
    }
}
