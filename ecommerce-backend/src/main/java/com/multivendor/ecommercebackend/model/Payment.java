package com.multivendor.ecommercebackend.model;

import com.multivendor.ecommercebackend.model.enums.PaymentStatus;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    // Which order this payment belongs to
    private String orderId;

    // Payment gateway reference (Razorpay later)
    private String gatewayPaymentId;

    // Amount attempted in this payment
    private double amount;

    // INITIATED, SUCCESS, FAILED, REFUNDED
    private PaymentStatus status;

    // When payment attempt happened
    private LocalDateTime createdAt;

    private String username;

}
