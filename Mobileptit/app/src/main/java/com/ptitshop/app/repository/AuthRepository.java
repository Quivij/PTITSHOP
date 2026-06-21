package com.ptitshop.app.repository;

import android.content.Context;
import com.ptitshop.app.core.network.RetrofitClient;
import com.ptitshop.app.core.storage.SessionManager;
import com.ptitshop.app.data.remote.api.AuthApi;
import com.ptitshop.app.data.remote.dto.request.*;
import com.ptitshop.app.data.remote.dto.response.*;

public class AuthRepository extends BaseRepository {
    private final AuthApi api;
    private final SessionManager session;
    public AuthRepository(Context c) {
        api=RetrofitClient.create(c, AuthApi.class);
        session=new SessionManager(c);
    }
    public void login(LoginRequest r, RepositoryCallback<LoginResponse>cb) {
        enqueue(api.login(r), new RepositoryCallback<LoginResponse>() {
            public void onSuccess(LoginResponse d) {
                if(d.data!=null)session.saveLoginSession(d.data.user, d.data.accessToken, d.data.refreshToken);
                cb.onSuccess(d);
            }
            public void onError(String m) {
                cb.onError(m);
            }
        }
        );
    }
    public void register(RegisterRequest r, RepositoryCallback<RegisterResponse>cb) {
        enqueue(api.register(r), cb);
    }
    public void verifyOtp(VerifyOtpRequest r, RepositoryCallback<SimpleResponse>cb) {
        enqueue(api.verifyOtp(r), cb);
    }
    public void resendOtp(ResendOtpRequest r, RepositoryCallback<SimpleResponse>cb) {
        enqueue(api.resendOtp(r), cb);
    }
    public void forgotPassword(ForgotPasswordRequest r, RepositoryCallback<SimpleResponse>cb) {
        enqueue(api.forgotPassword(r), cb);
    }
    public void logout() {
        session.clear();
    }
}
