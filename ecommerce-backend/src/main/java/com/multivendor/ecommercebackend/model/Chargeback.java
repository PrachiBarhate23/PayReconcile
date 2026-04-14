package com.multivendor.ecommercebackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "chargebacks")
public class Chargeback {

    @Id
    private String id;
    private String chargebackId;
    private String paymentId;
    private String orderId;
    private String userId;
    private Double chargebackAmount;
    private String reason;
    private String status; // INITIATED, UNDER_REVIEW, RESOLVED, LOST, WON
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String evidence;
    private String resolution;
    private String notes;

    public Chargeback() {
        this.createdAt = LocalDateTime.now();
        this.status = "INITIATED";
    }

    // GETTERS
    public String getId() { return id; }
    public String getChargebackId() { return chargebackId; }
    public String getPaymentId() { return paymentId; }
    public String getOrderId() { return orderId; }
    public String getUserId() { return userId; }
    public Double getChargebackAmount() { return chargebackAmount; }
    public String getReason() { return reason; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public String getEvidence() { return evidence; }
    public String getResolution() { return resolution; }
    public String getNotes() { return notes; }

    // SETTERS
    public void setId(String id) { this.id = id; }
    public void setChargebackId(String chargebackId) { this.chargebackId = chargebackId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setChargebackAmount(Double chargebackAmount) { this.chargebackAmount = chargebackAmount; }
    public void setReason(String reason) { this.reason = reason; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public void setEvidence(String evidence) { this.evidence = evidence; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    public void setNotes(String notes) { this.notes = notes; }
}
