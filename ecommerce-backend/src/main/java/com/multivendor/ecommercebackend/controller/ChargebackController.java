package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.model.Chargeback;
import com.multivendor.ecommercebackend.service.ChargebackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chargebacks")
public class ChargebackController {

    @Autowired
    private ChargebackService chargebackService;

    @PostMapping("/initiate")
    public ResponseEntity<Chargeback> initiateChargeback(@RequestParam String paymentId,
                                                         @RequestParam String orderId,
                                                         @RequestParam String userId,
                                                         @RequestParam Double amount,
                                                         @RequestParam String reason) {
        Chargeback chargeback = chargebackService.initiateChargeback(paymentId, orderId, userId, amount, reason);
        return ResponseEntity.ok(chargeback);
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Chargeback>> getAllChargebacks() {
        return ResponseEntity.ok(chargebackService.getAllChargebacks());
    }

    @GetMapping("/{chargebackId}")
    public ResponseEntity<Chargeback> getChargeback(@PathVariable String chargebackId) {
        Chargeback chargeback = chargebackService.getChargeback(chargebackId);
        if (chargeback != null) {
            return ResponseEntity.ok(chargeback);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Chargeback>> getChargebacksByStatus(@PathVariable String status) {
        return ResponseEntity.ok(chargebackService.getChargebacksByStatus(status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Chargeback>> getChargebacksByUser(@PathVariable String userId) {
        return ResponseEntity.ok(chargebackService.getChargebacksByUser(userId));
    }

    @PutMapping("/{chargebackId}/status")
    public ResponseEntity<Chargeback> updateStatus(@PathVariable String chargebackId,
                                                    @RequestParam String status,
                                                    @RequestParam(required = false) String resolution) {
        Chargeback chargeback = chargebackService.updateChargebackStatus(chargebackId, status, resolution);
        if (chargeback != null) {
            return ResponseEntity.ok(chargeback);
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/{chargebackId}/evidence")
    public ResponseEntity<Chargeback> addEvidence(@PathVariable String chargebackId,
                                                   @RequestBody EvidenceRequest request) {
        Chargeback chargeback = chargebackService.addEvidenceToChargeback(chargebackId, request.evidence);
        if (chargeback != null) {
            return ResponseEntity.ok(chargeback);
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/stats/active-count")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getActiveChargebackCount() {
        return ResponseEntity.ok(chargebackService.getActiveChargebackCount());
    }

    @GetMapping("/stats/total-amount")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Double> getTotalChargebackAmount() {
        return ResponseEntity.ok(chargebackService.getTotalChargebackAmount());
    }

    static class EvidenceRequest {
        public String evidence;
    }
}
