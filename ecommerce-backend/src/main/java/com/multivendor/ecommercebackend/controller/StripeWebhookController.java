package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.Entity.WebhookEvent;
import com.multivendor.ecommercebackend.repository.WebhookEventRepository;
import com.multivendor.ecommercebackend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/webhook/stripe")
public class StripeWebhookController {

    private final PaymentService paymentService;
    private final WebhookEventRepository webhookEventRepository;

    public StripeWebhookController(PaymentService paymentService,
                                   WebhookEventRepository webhookEventRepository) {
        this.paymentService = paymentService;
        this.webhookEventRepository = webhookEventRepository;
    }

    // 🔹 Stripe webhook (POST)
    @PostMapping
    public ResponseEntity<String> handleStripeEvent(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        System.out.println("🔥 WEBHOOK HIT 🔥");

        paymentService.handleStripeEvent(payload, sigHeader);
        return ResponseEntity.ok("Webhook processed");
    }

    @GetMapping("/logs")
    public List<WebhookEvent> getAllWebhookLogs(Authentication authentication) {

        String username = authentication.getName();

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return webhookEventRepository.findAll();
        }

        return webhookEventRepository.findByUsername(username);
    }

}
