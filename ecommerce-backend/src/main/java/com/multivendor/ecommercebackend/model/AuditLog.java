package com.multivendor.ecommercebackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;
    private String userId;
    private String action;
    private String entityType;
    private String entityId;
    private String changes;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
    private String status; // SUCCESS, FAILED

    public AuditLog() {
        this.createdAt = LocalDateTime.now();
        this.status = "SUCCESS";
    }

    // GETTERS
    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public String getEntityId() { return entityId; }
    public String getChanges() { return changes; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getStatus() { return status; }

    // SETTERS
    public void setId(String id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setAction(String action) { this.action = action; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public void setChanges(String changes) { this.changes = changes; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setStatus(String status) { this.status = status; }
}
