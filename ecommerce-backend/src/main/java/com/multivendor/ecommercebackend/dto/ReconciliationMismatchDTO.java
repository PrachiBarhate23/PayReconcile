package com.multivendor.ecommercebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ReconciliationMismatchDTO {

    private String id;
    private String orderId;
    private String paymentId;
    private String issue;
    private LocalDateTime detectedAt;
    private String status;
    private String autoRefundId;
}
