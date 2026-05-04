package com.multivendor.ecommercebackend.service.impl;

import com.multivendor.ecommercebackend.Entity.WebhookEvent;
import com.multivendor.ecommercebackend.model.Order;
import com.multivendor.ecommercebackend.model.Payment;
import com.multivendor.ecommercebackend.model.enums.PaymentStatus;
import com.multivendor.ecommercebackend.repository.PaymentRepository;
import com.multivendor.ecommercebackend.repository.WebhookEventRepository;
import com.multivendor.ecommercebackend.service.LedgerService;
import com.multivendor.ecommercebackend.service.OrderService;
import com.multivendor.ecommercebackend.service.PaymentService;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.Webhook;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final LedgerService ledgerService;
    private final WebhookEventRepository webhookEventRepository;

    @Value("${stripe.webhook.secret}")
    private String stripeWebhookSecret;

    /* =========================================================
       🔐 SECURITY HELPERS (SaaS)
    ========================================================== */

    private Authentication getAuth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private boolean isAdmin() {
        return getAuth().getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private String getCurrentUsername() {
        return getAuth().getName();
    }

    /* =========================================================
       CREATE STRIPE PAYMENT INTENT
    ========================================================== */

    @Override
    public Map<String, String> createStripePaymentIntent(String orderId) {

        Order order = orderService.getOrderById(orderId);

        double amount = order.getAmount();
        String username = order.getUsername();

        try {
            Map<String, Object> params = new HashMap<>();
            params.put("amount", (long) (amount * 100));
            params.put("currency", "inr");
            params.put("metadata", Map.of("orderId", orderId));

            params.put("automatic_payment_methods", Map.of(
                    "enabled", true,
                    "allow_redirects", "never"
            ));

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            Payment payment = new Payment();
            payment.setOrderId(orderId);
            payment.setGatewayPaymentId(paymentIntent.getId());
            payment.setAmount(amount);
            payment.setStatus(PaymentStatus.PENDING);
            payment.setCreatedAt(LocalDateTime.now());
            payment.setUsername(username);

            paymentRepository.save(payment);

            orderService.markPaymentPending(orderId);

            return Map.of(
                    "clientSecret", paymentIntent.getClientSecret(),
                    "paymentIntentId", paymentIntent.getId()
            );

        } catch (StripeException e) {
            throw new RuntimeException("Failed to create Stripe PaymentIntent", e);
        }
    }

    /* =========================================================
       STRIPE WEBHOOK HANDLER (CORRECT VERSION)
    ========================================================== */

    @Override
    public void handleStripeEvent(String payload, String signature) {

        Event event;

        try {
            event = Webhook.constructEvent(payload, signature, stripeWebhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Webhook signature verification failed", e);
            throw new RuntimeException("Invalid Stripe signature", e);
        }

        log.info("Stripe Event Received: {}", event.getType());

        // Idempotency check
        if (webhookEventRepository.existsById(event.getId())) {
            log.warn("Event already processed: {}", event.getId());
            return;
        }

        // Save webhook log
        WebhookEvent log = new WebhookEvent();
        log.setId(event.getId());
        log.setEventType(event.getType());
        log.setReceivedAt(LocalDateTime.now());
        log.setProcessingStatus("PROCESSED");
        log.setPayload(payload);
        webhookEventRepository.save(log);

        try {

            String eventType = event.getType();

            if ("payment_intent.succeeded".equals(eventType)
                    || "payment_intent.payment_failed".equals(eventType)) {

                // 🔥 Parse PaymentIntent ID manually from raw JSON
                com.google.gson.JsonObject json =
                        com.google.gson.JsonParser.parseString(payload)
                                .getAsJsonObject();

                String paymentIntentId = json
                        .getAsJsonObject("data")
                        .getAsJsonObject("object")
                        .get("id")
                        .getAsString();

                System.out.println("🎯 Extracted PaymentIntent ID: " + paymentIntentId);

                if ("payment_intent.succeeded".equals(eventType)) {
                    markPaymentSuccess(paymentIntentId);
                }

                if ("payment_intent.payment_failed".equals(eventType)) {
                    markPaymentFailed(paymentIntentId);
                }
            }

        } catch (Exception e) {
            log.error("Error processing Stripe webhook event", e);
        }
    }

    /* =========================================================
       SUCCESS HANDLER
    ========================================================== */

    private void markPaymentSuccess(String gatewayPaymentId) {

        try {

            Payment payment = paymentRepository
                    .findByGatewayPaymentId(gatewayPaymentId)
                    .orElse(null);
            log.debug("Searching payment for: {}", gatewayPaymentId);
            log.debug("Found payment: {}", payment);

            if (payment == null) {
                log.warn("Payment not found for gateway ID: {}", gatewayPaymentId);
                return;
            }

            if (payment.getStatus() == PaymentStatus.SUCCESS) return;

            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            orderService.markOrderPaid(payment.getOrderId());

            ledgerService.recordDebit(
                    payment.getOrderId(),
                    payment.getAmount(),
                    payment.getUsername()
            );

            log.info("Payment marked SUCCESS for gateway ID: {}", gatewayPaymentId);

        } catch (Exception e) {
            log.error("Error marking payment success for: {}", gatewayPaymentId, e);
        }
    }

    /* =========================================================
       FAILURE HANDLER
    ========================================================== */

    private void markPaymentFailed(String gatewayPaymentId) {

        try {

            PaymentIntent paymentIntent = PaymentIntent.retrieve(gatewayPaymentId);
            String orderId = paymentIntent.getMetadata().get("orderId");

            if (orderId == null) return;

            Payment payment = paymentRepository
                    .findTopByOrderIdOrderByCreatedAtDesc(orderId)
                    .orElse(null);

            if (payment == null) return;

            if (payment.getStatus() == PaymentStatus.FAILED) return;

            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            orderService.markOrderFailed(orderId);

        } catch (Exception e) {
            log.error("Error marking payment failed for: {}", gatewayPaymentId, e);
        }
    }

    /* =========================================================
       REFUND
    ========================================================== */

    @Override
    public void refundPayment(String paymentIntentId) {

        paymentRepository.findByGatewayPaymentId(paymentIntentId)
                .ifPresent(payment -> {

                    if (payment.getStatus() == PaymentStatus.REFUNDED) return;

                    try {
                        Refund.create(Map.of("payment_intent", paymentIntentId));
                    } catch (StripeException e) {
                        throw new RuntimeException("Stripe refund failed", e);
                    }

                    ledgerService.recordCredit(
                            payment.getOrderId(),
                            payment.getAmount(),
                            payment.getUsername()
                    );

                    payment.setStatus(PaymentStatus.REFUNDED);
                    paymentRepository.save(payment);
                });
    }

    @Override
    public void refundLatestPaymentByOrder(String orderId) {

        Payment payment = paymentRepository
                .findTopByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        refundPayment(payment.getGatewayPaymentId());
    }

    /* =========================================================
       SaaS GET PAYMENTS
    ========================================================== */

    @Override
    public List<Payment> getAllPayments() {

        if (isAdmin()) {
            return paymentRepository.findAll();
        }

        return paymentRepository.findByUsername(getCurrentUsername());
    }

    @Override
    public Payment getPaymentById(String paymentId) {

        if (isAdmin()) {
            return paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
        }

        return paymentRepository.findByIdAndUsername(
                        paymentId,
                        getCurrentUsername()
                )
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}
