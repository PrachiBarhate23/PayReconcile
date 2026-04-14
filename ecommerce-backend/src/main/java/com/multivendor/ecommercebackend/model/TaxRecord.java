package com.multivendor.ecommercebackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "tax_records")
public class TaxRecord {

    @Id
    private String id;
    private String transactionId;
    private String orderId;
    private Double taxableAmount;
    private Double taxRate;
    private Double taxAmount;
    private String taxType; // VAT, GST, SALES_TAX, etc.
    private String country;
    private String state;
    private LocalDateTime createdAt;

    public TaxRecord() {
        this.createdAt = LocalDateTime.now();
    }

    // GETTERS
    public String getId() { return id; }
    public String getTransactionId() { return transactionId; }
    public String getOrderId() { return orderId; }
    public Double getTaxableAmount() { return taxableAmount; }
    public Double getTaxRate() { return taxRate; }
    public Double getTaxAmount() { return taxAmount; }
    public String getTaxType() { return taxType; }
    public String getCountry() { return country; }
    public String getState() { return state; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // SETTERS
    public void setId(String id) { this.id = id; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public void setTaxableAmount(Double taxableAmount) { this.taxableAmount = taxableAmount; }
    public void setTaxRate(Double taxRate) { this.taxRate = taxRate; }
    public void setTaxAmount(Double taxAmount) { this.taxAmount = taxAmount; }
    public void setTaxType(String taxType) { this.taxType = taxType; }
    public void setCountry(String country) { this.country = country; }
    public void setState(String state) { this.state = state; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
