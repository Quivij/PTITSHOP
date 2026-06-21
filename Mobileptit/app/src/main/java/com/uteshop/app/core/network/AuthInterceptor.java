package com.uteshop.app.core.network;

import android.content.Context;
import androidx.annotation.NonNull;
import com.uteshop.app.core.storage.SessionManager;
import java.io.IOException;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class AuthInterceptor implements Interceptor {
    private final SessionManager sessionManager;
    public AuthInterceptor(Context c) {
        sessionManager=new SessionManager(c);
    }
    @NonNull @Override public Response intercept(@NonNull Chain chain)throws IOException {
        Request original=chain.request();
        String token=sessionManager.getAccessToken();
        if(token==null||token.isEmpty()||original.url().encodedPath().contains("refresh-token"))return chain.proceed(original);
        return chain.proceed(original.newBuilder().addHeader("Authorization", "Bearer "+token).build());
    }
}
