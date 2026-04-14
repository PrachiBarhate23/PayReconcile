package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.model.AuditLog;
import com.multivendor.ecommercebackend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.google.gson.Gson;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    private final Gson gson = new Gson();

    public void logAction(String userId, String action, String entityType, String entityId, 
                         String changes, String ipAddress, String userAgent) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setChanges(changes);
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        auditLog.setStatus("SUCCESS");

        AuditLog saved = auditLogRepository.save(auditLog);

        // Publish to Kafka for async processing
        kafkaTemplate.send("audit-logs", gson.toJson(saved));

        log.info("Audit log created: User: {}, Action: {}, Entity: {}", userId, action, entityType);
    }

    public AuditLog logAction(String userId, String action, String entityType, String entityId, String changes) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setChanges(changes);
        auditLog.setStatus("SUCCESS");

        AuditLog saved = auditLogRepository.save(auditLog);
        kafkaTemplate.send("audit-logs", gson.toJson(saved));
        return saved;
    }

    public List<AuditLog> getAuditLogsByUser(String userId) {
        return auditLogRepository.findByUserId(userId);
    }

    public List<AuditLog> getAuditLogsByEntity(String entityType, String entityId) {
        List<AuditLog> logs = auditLogRepository.findByEntityId(entityId);
        return logs.stream()
                .filter(log -> log.getEntityType().equals(entityType))
                .toList();
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    public List<AuditLog> getAuditLogsBetween(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByCreatedAtBetween(start, end);
    }

    public Long getAuditLogCount() {
        return auditLogRepository.count();
    }

    public void logFailure(String userId, String action, String reason, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setAction(action);
        auditLog.setChanges(reason);
        auditLog.setIpAddress(ipAddress);
        auditLog.setStatus("FAILED");

        auditLogRepository.save(auditLog);
        log.warn("Audit log (FAILED): User: {}, Action: {}, Reason: {}", userId, action, reason);
    }
}
