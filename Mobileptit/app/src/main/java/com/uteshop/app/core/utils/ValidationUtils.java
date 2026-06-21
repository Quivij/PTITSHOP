package com.uteshop.app.core.utils;

import android.util.Patterns;

public final class ValidationUtils {
    private ValidationUtils() {
    }
    public static boolean isEmpty(String s) {
        return s==null||s.trim().isEmpty();
    }
    public static boolean isEmail(String s) {
        return s!=null&&Patterns.EMAIL_ADDRESS.matcher(s).matches();
    }
    public static boolean isStrongPassword(String s) {
        return s!=null&&s.length()>=6;
    }
}
