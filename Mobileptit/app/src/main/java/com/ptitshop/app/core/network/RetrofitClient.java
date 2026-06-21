package com.ptitshop.app.core.network;

import android.content.Context;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ptitshop.app.BuildConfig;
import com.ptitshop.app.core.constants.ApiConstants;
import java.util.concurrent.TimeUnit;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {
    private static volatile Retrofit retrofit;
    public static Retrofit getInstance(Context context) {
        if(retrofit==null) {
            synchronized(RetrofitClient.class) {
                if(retrofit==null) {
                    HttpLoggingInterceptor logging=new HttpLoggingInterceptor();
                    logging.setLevel(BuildConfig.DEBUG?HttpLoggingInterceptor.Level.BODY:HttpLoggingInterceptor.Level.NONE);
                    OkHttpClient client=new OkHttpClient.Builder().connectTimeout(30, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS).writeTimeout(30, TimeUnit.SECONDS).addInterceptor(new AuthInterceptor(context.getApplicationContext())).authenticator(new TokenAuthenticator(context.getApplicationContext())).addInterceptor(logging).build();
                    Gson gson=new GsonBuilder().setLenient().create();
                    retrofit=new Retrofit.Builder().baseUrl(ApiConstants.BASE_URL).client(client).addConverterFactory(GsonConverterFactory.create(gson)).build();
                }
            }
        }
        return retrofit;
    }
    public static<T>T create(Context c, Class<T>cls) {
        return getInstance(c).create(cls);
    }
}
