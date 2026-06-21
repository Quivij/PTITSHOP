package com.uteshop.app.core.network;

import android.content.Context;
import androidx.annotation.Nullable;
import com.google.gson.Gson;
import com.uteshop.app.core.constants.ApiConstants;
import com.uteshop.app.core.storage.SessionManager;
import com.uteshop.app.data.remote.dto.request.RefreshTokenRequest;
import com.uteshop.app.data.remote.dto.response.RefreshTokenResponse;
import java.io.IOException;
import okhttp3.Authenticator;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.Route;

public class TokenAuthenticator implements Authenticator {
    private final SessionManager sessionManager;
    private final Gson gson=new Gson();
    public TokenAuthenticator(Context c) {
        sessionManager=new SessionManager(c);
    }
    @Nullable @Override public Request authenticate(@Nullable Route route, Response response)throws IOException {
        if(responseCount(response)>=2||response.request().url().encodedPath().contains("refresh-token"))return null;
        String rt=sessionManager.getRefreshToken();
        if(rt==null||rt.isEmpty())return null;
        RequestBody body=RequestBody.create(gson.toJson(new RefreshTokenRequest(rt)), MediaType.get("application/json; charset=utf-8"));
        Request req=new Request.Builder().url(ApiConstants.BASE_URL+ApiConstants.API_PREFIX+"refresh-token").post(body).build();
        try(Response rr=new OkHttpClient().newCall(req).execute()) {
            if(!rr.isSuccessful()||rr.body()==null)return null;
            RefreshTokenResponse tr=gson.fromJson(rr.body().charStream(), RefreshTokenResponse.class);
            if(tr==null||tr.data==null||tr.data.accessToken==null)return null;
            sessionManager.saveAccessToken(tr.data.accessToken);
            return response.request().newBuilder().header("Authorization", "Bearer "+tr.data.accessToken).build();
        }
    }
    private int responseCount(Response r) {
        int c=1;
        while((r=r.priorResponse())!=null)c++;
        return c;
    }
}
