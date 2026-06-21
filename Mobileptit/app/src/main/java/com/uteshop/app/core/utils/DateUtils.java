package com.uteshop.app.core.utils;

public final class DateUtils {
    private DateUtils() {
    }
    public static String safe(String iso) {
        return iso==null?"":iso.replace("T", " ").replace("Z", "");
    }
}
