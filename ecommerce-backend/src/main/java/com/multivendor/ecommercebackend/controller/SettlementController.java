package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.model.Settlement;
import com.multivendor.ecommercebackend.service.SettlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settlements")
public class SettlementController {

    @Autowired
    private SettlementService settlementService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Settlement>> getAllSettlements() {
        return ResponseEntity.ok(settlementService.getAllSettlements());
    }

    @GetMapping("/{settlementId}")
    public ResponseEntity<Settlement> getSettlement(@PathVariable String settlementId) {
        Settlement settlement = settlementService.getSettlement(settlementId);
        if (settlement != null) {
            return ResponseEntity.ok(settlement);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Settlement>> getSettlementsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(settlementService.getSettlementsByStatus(status));
    }

    @GetMapping("/monthly/{year}/{month}")
    public ResponseEntity<List<Settlement>> getMonthlySettlements(@PathVariable int year, @PathVariable int month) {
        return ResponseEntity.ok(settlementService.getMonthlySettlements(year, month));
    }

    @PostMapping("/{settlementId}/complete")
    public ResponseEntity<Settlement> completeSettlement(@PathVariable String settlementId) {
        Settlement settlement = settlementService.completeSettlement(settlementId);
        if (settlement != null) {
            return ResponseEntity.ok(settlement);
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/monthly/total")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Double> getMonthlyTotal() {
        return ResponseEntity.ok(settlementService.getMonthlySettlementTotal());
    }

    @PostMapping("/demo")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Settlement> createDemoSettlement() {
        String settlementId = "SET-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Double totalAmount = 10500.00;
        Double taxAmount = 500.00;
        
        List<String> transactions = java.util.Arrays.asList("PAY-123", "PAY-456", "PAY-789");
        Settlement demo = settlementService.createSettlement(settlementId, totalAmount, taxAmount, "USD", transactions);
        
        // Let's also magically complete it to show robust UI status
        demo = settlementService.completeSettlement(demo.getSettlementId());
        
        return ResponseEntity.ok(demo);
    }
}
