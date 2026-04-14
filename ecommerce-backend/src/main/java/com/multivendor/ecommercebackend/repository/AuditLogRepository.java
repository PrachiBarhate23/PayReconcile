package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findByUserId(String userId);
    List<AuditLog> findByEntityType(String entityType);
    List<AuditLog> findByEntityId(String entityId);
    List<AuditLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
