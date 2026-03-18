package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class RefundController {

    private final PaymentService paymentService;

    // 🔒 Only ADMIN can refund
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/refund/{orderId}")
    public ResponseEntity<String> refund(@PathVariable String orderId) {

        paymentService.refundLatestPaymentByOrder(orderId);

        return ResponseEntity.ok("Refund initiated");
    }
}
