package com.multivendor.ecommercebackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "password_resets")
public class PasswordReset {

    @Id
    private String id;
    private String userId;
    private String email;
    private String token;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isUsed;

    public PasswordReset() {
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(1);
        this.isUsed = false;
    }

    // GETTERS
    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getToken() { return token; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public Boolean getIsUsed() { return isUsed; }

    // SETTERS
    public void setId(String id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setEmail(String email) { this.email = email; }
    public void setToken(String token) { this.token = token; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public void setIsUsed(Boolean isUsed) { this.isUsed = isUsed; }
}
