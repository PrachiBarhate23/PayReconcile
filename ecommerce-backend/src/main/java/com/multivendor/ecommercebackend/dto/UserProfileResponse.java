package com.multivendor.ecommercebackend.dto;

import java.time.LocalDateTime;

public class UserProfileResponse {

    private String id;
    private String username;
    private String email;
    private String role;
    private Double accountBalance;
    private Double totalEarnings;
    private Double totalPayouts;
    private Double pendingBalance;
    private String preferredCurrency;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    public UserProfileResponse(String id, String username, String email, String role,
                               Double accountBalance, Double totalEarnings, Double totalPayouts,
                               Double pendingBalance, String preferredCurrency,
                               LocalDateTime createdAt, LocalDateTime lastUpdated) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.accountBalance = accountBalance;
        this.totalEarnings = totalEarnings;
        this.totalPayouts = totalPayouts;
        this.pendingBalance = pendingBalance;
        this.preferredCurrency = preferredCurrency;
        this.createdAt = createdAt;
        this.lastUpdated = lastUpdated;
    }

    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Double getAccountBalance() { return accountBalance; }
    public Double getTotalEarnings() { return totalEarnings; }
    public Double getTotalPayouts() { return totalPayouts; }
    public Double getPendingBalance() { return pendingBalance; }
    public String getPreferredCurrency() { return preferredCurrency; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
}