package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.dto.ReconciliationMismatchDTO;
import com.multivendor.ecommercebackend.service.ReconciliationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reconciliation")
@RequiredArgsConstructor
public class ReconciliationController {

    private final ReconciliationService reconciliationService;

    @PostMapping("/run")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public String runReconciliation() {
        reconciliationService.reconcileOrders();
        return "Reconciliation completed";
    }

    @GetMapping("/mismatches")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public List<ReconciliationMismatchDTO> getMismatches() {
        return reconciliationService.getAllMismatches();
    }
}
