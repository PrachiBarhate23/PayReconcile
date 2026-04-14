package com.multivendor.ecommercebackend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String RECONCILIATION_TOPIC = "reconciliation-jobs";
    public static final String SETTLEMENT_TOPIC = "settlement-jobs";
    public static final String NOTIFICATION_TOPIC = "notifications";
    public static final String AUDIT_TOPIC = "audit-logs";

    @Bean
    public NewTopic reconciliationTopic() {
        return TopicBuilder.name(RECONCILIATION_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic settlementTopic() {
        return TopicBuilder.name(SETTLEMENT_TOPIC)
                .partitions(2)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic notificationTopic() {
        return TopicBuilder.name(NOTIFICATION_TOPIC)
                .partitions(2)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic auditTopic() {
        return TopicBuilder.name(AUDIT_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
