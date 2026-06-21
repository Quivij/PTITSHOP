package com.uteshop.app.core.network;

public class NetworkResult<T>{
    public final boolean success;
    public final T data;
    public final String message;
    private NetworkResult(boolean s, T d, String m) {
        success=s;
        data=d;
        message=m;
    }
    public static<T>NetworkResult<T>success(T d) {
        return new NetworkResult<>(true, d, null);
    }
    public static<T>NetworkResult<T>error(String m) {
        return new NetworkResult<>(false, null, m);
    }
}
