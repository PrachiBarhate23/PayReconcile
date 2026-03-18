package com.multivendor.ecommercebackend.dto;

public class UserProfileResponse {

    private String id;
    private String username;
    private String role;

    public UserProfileResponse(String id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
}