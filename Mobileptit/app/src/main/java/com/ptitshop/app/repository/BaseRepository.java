package com.ptitshop.app.repository;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.IOException;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public abstract class BaseRepository {
    protected<T>void enqueue(Call<T>call, RepositoryCallback<T>cb) {
        call.enqueue(new Callback<T>() {
            public void onResponse(Call<T>c, Response<T>r) {
                if(r.isSuccessful()&& r.body()!=null)cb.onSuccess(r.body());
                else cb.onError(parseError(r));
            }
            public void onFailure(Call<T>c, Throwable t) {
                cb.onError(t.getMessage()==null?"Network error":t.getMessage());
            }
        }
        );
    }
    protected String parseError(Response<?>r) {
        try{
            if(r.errorBody()!=null) {
                String raw=r.errorBody().string();
                JsonObject o=JsonParser.parseString(raw).getAsJsonObject();
                if(o.has("message"))return o.get("message").getAsString();
                if(o.has("error"))return o.get("error").getAsString();
            }
        }
        catch(Exception ignored) {
        }
        return "HTTP "+r.code();
    }
}
