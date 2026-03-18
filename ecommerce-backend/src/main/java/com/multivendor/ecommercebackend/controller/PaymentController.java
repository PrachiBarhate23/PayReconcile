package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.model.Payment;
import com.multivendor.ecommercebackend.service.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public Payment getPayment(@PathVariable String id) {
        return paymentService.getPaymentById(id);
    }

    @PostMapping("/create-intent/{orderId}")
    public Map<String, String> createPaymentIntent(
            @PathVariable String orderId
    ) {
        return paymentService.createStripePaymentIntent(orderId);
    }

    @PostMapping("/refund/{paymentIntentId}")
    public String refund(@PathVariable String paymentIntentId) {
        paymentService.refundPayment(paymentIntentId);
        return "Refund processed";
    }
}
