package com.ptitshop.app.data.remote.dto.request;

public class CategoryMutationRequest {
    public String name, description;
    public CategoryMutationRequest(String name, String description) {
        this.name=name;
        this.description=description;
    }
}
