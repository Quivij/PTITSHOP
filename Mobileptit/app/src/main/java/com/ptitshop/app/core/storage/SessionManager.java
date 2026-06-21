package com.ptitshop.app.core.storage;

import android.content.Context;
import android.content.SharedPreferences;
import com.ptitshop.app.data.model.User;

public class SessionManager {
    private static final String PREF_NAME="ptitshop_session", KEY_ACCESS_TOKEN="access_token", KEY_REFRESH_TOKEN="refresh_token", KEY_USER_ID="user_id", KEY_USERNAME="username", KEY_EMAIL="email", KEY_FULL_NAME="full_name", KEY_IS_ADMIN="is_admin", KEY_XU="xu";
    private final SharedPreferences prefs;
    public SessionManager(Context c) {
        prefs=c.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }
    public void saveTokens(String a, String r) {
        prefs.edit().putString(KEY_ACCESS_TOKEN, a).putString(KEY_REFRESH_TOKEN, r).apply();
    }
    public void saveAccessToken(String a) {
        prefs.edit().putString(KEY_ACCESS_TOKEN, a).apply();
    }
    public void saveLoginSession(User u, String a, String r) {
        SharedPreferences.Editor e=prefs.edit().putString(KEY_ACCESS_TOKEN, a).putString(KEY_REFRESH_TOKEN, r);
        if(u!=null)e.putString(KEY_USER_ID, u.id).putString(KEY_USERNAME, u.username).putString(KEY_EMAIL, u.email).putString(KEY_FULL_NAME, u.fullName).putBoolean(KEY_IS_ADMIN, Boolean.TRUE.equals(u.isAdmin)).putInt(KEY_XU, u.xu==null?0:u.xu);
        e.apply();
    }
    public String getAccessToken() {
        return prefs.getString(KEY_ACCESS_TOKEN, null);
    }
    public String getRefreshToken() {
        return prefs.getString(KEY_REFRESH_TOKEN, null);
    }
    public boolean isLoggedIn() {
        String t=getAccessToken();
        return t!=null&&!t.isEmpty();
    }
    public String getUserId() {
        return prefs.getString(KEY_USER_ID, null);
    }
    public String getFullName() {
        return prefs.getString(KEY_FULL_NAME, "");
    }
    public String getEmail() {
        return prefs.getString(KEY_EMAIL, "");
    }
    public boolean isAdmin() {
        return prefs.getBoolean(KEY_IS_ADMIN, false);
    }
    public int getXu() {
        return prefs.getInt(KEY_XU, 0);
    }
    public void clear() {
        prefs.edit().clear().apply();
    }
}
