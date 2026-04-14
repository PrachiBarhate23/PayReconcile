package com.multivendor.ecommercebackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "settlements")
public class Settlement {

    @Id
    private String id;
    private String settlementId;
    private LocalDateTime settlementDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double totalAmount;
    private Double taxAmount;
    private Double netAmount;
    private String currency;
    private String status; // PENDING, COMPLETED, FAILED
    private List<String> transactionIds;
    private String bankAccountId;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    public Settlement() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    // GETTERS
    public String getId() { return id; }
    public String getSettlementId() { return settlementId; }
    public LocalDateTime getSettlementDate() { return settlementDate; }
    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public Double getTotalAmount() { return totalAmount; }
    public Double getTaxAmount() { return taxAmount; }
    public Double getNetAmount() { return netAmount; }
    public String getCurrency() { return currency; }
    public String getStatus() { return status; }
    public List<String> getTransactionIds() { return transactionIds; }
    public String getBankAccountId() { return bankAccountId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getProcessedAt() { return processedAt; }

    // SETTERS
    public void setId(String id) { this.id = id; }
    public void setSettlementId(String settlementId) { this.settlementId = settlementId; }
    public void setSettlementDate(LocalDateTime settlementDate) { this.settlementDate = settlementDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public void setTaxAmount(Double taxAmount) { this.taxAmount = taxAmount; }
    public void setNetAmount(Double netAmount) { this.netAmount = netAmount; }
    public void setCurrency(String currency) { this.currency = currency; }
    public void setStatus(String status) { this.status = status; }
    public void setTransactionIds(List<String> transactionIds) { this.transactionIds = transactionIds; }
    public void setBankAccountId(String bankAccountId) { this.bankAccountId = bankAccountId; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}
