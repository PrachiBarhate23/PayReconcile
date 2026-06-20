package com.multivendor.ecommercebackend.model;

import com.multivendor.ecommercebackend.model.enums.JobStatus;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "reconciliation_jobs")
public class ReconciliationJob {

    @Id
    private String id;

    private String orderId;
    private String paymentId;
    private String username;

    private JobStatus status;

    private int retryCount;
    private LocalDateTime nextRetryAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
