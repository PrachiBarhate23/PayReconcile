package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.dto.ReconciliationMismatchDTO;
import com.multivendor.ecommercebackend.model.ReconciliationJob;
import com.multivendor.ecommercebackend.model.enums.JobStatus;
import com.multivendor.ecommercebackend.repository.ReconciliationJobRepository;
import com.multivendor.ecommercebackend.service.ReconciliationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reconciliation")
@RequiredArgsConstructor
public class ReconciliationController {

    private final ReconciliationService reconciliationService;
    private final ReconciliationJobRepository jobRepository;

    @PostMapping("/run")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public String runReconciliation() {
        reconciliationService.processPendingJobs();
        return "Reconciliation background jobs processed";
    }

    @GetMapping("/mismatches")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public List<ReconciliationMismatchDTO> getMismatches() {
        return reconciliationService.getAllMismatches();
    }
    
    @GetMapping("/jobs")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public List<ReconciliationJob> getJobs(@RequestParam(required = false) JobStatus status) {
        if (status != null) {
            return jobRepository.findByStatus(status);
        }
        return jobRepository.findAll();
    }

    /**
     * DEMO ENDPOINT: Forcefully inject a mismatch into a recent PAID order
     * so that the reconciliation engine detects and auto-refunds it.
     */
    @PostMapping("/simulate-mismatch")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> simulateMismatch() {
        return reconciliationService.simulateMismatch();
    }

    /**
     * DEMO ENDPOINT: Run reconciliation immediately (no 5-min wait).
     */
    @PostMapping("/run-now")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public String runNow() {
        reconciliationService.processPendingJobs();
        return "Reconciliation completed";
    }
}
