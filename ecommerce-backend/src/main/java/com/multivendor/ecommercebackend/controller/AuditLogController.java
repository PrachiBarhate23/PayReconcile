package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.model.AuditLog;
import com.multivendor.ecommercebackend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audits")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllAuditLogs());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getLogsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(auditLogService.getAuditLogsByUser(userId));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLog>> getLogsByEntity(@PathVariable String entityType,
                                                          @PathVariable String entityId) {
        return ResponseEntity.ok(auditLogService.getAuditLogsByEntity(entityType, entityId));
    }

    @GetMapping("/between")
    public ResponseEntity<List<AuditLog>> getLogsBetween(@RequestParam LocalDateTime startDate,
                                                         @RequestParam LocalDateTime endDate) {
        return ResponseEntity.ok(auditLogService.getAuditLogsBetween(startDate, endDate));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getAuditLogCount() {
        return ResponseEntity.ok(auditLogService.getAuditLogCount());
    }
}
