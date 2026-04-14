package com.multivendor.ecommercebackend.dto;

public class UserProfileResponse {

    private String id;
    private String username;
    private String role;
    private Double accountBalance;
    private String preferredCurrency;

    public UserProfileResponse(String id, String username, String role, Double accountBalance, String preferredCurrency) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.accountBalance = accountBalance;
        this.preferredCurrency = preferredCurrency;
    }

    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public Double getAccountBalance() { return accountBalance; }
    public String getPreferredCurrency() { return preferredCurrency; }
}