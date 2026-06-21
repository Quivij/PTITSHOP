package com.uteshop.app.data.model;

import com.google.gson.annotations.SerializedName;

public class User {
    @SerializedName("_id")public String id;
    public String fullName;
    public String phoneNumber;
    public Boolean gender;
    public String dateOfBirth;
    public String avt;
    public String email;
    public String username;
    public Boolean isActive;
    public Integer xu;
    public Boolean isAdmin;
    public java.util.List<String> viewedProducts;
    public java.util.List<String> favProducts;
    public String createdAt;
    public String updatedAt;
}
