package com.multivendor.ecommercebackend.Entity;


import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
@Document(collection = "webhook_logs")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WebhookEvent {

    @Id
    private String id;

    private String eventType;

    private LocalDateTime receivedAt;

    private String processingStatus;

    private String payload;

    // 🔥 ADD THIS (SaaS isolation)
    private String username;
}
