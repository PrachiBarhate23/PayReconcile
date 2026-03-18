package com.multivendor.ecommercebackend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "reconciliation_logs")
public class ReconciliationLog {

    @Id
    private String id;

    private String orderId;
    private String paymentId;

    private String issue;
    private String actionTaken;
    private String status;

    private LocalDateTime detectedAt;
    private LocalDateTime resolvedAt;

    // ✅ VERY IMPORTANT (SaaS isolation)
    private String username;
}
