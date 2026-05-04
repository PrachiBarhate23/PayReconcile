package com.multivendor.ecommercebackend.service.impl;

import com.multivendor.ecommercebackend.dto.ReconciliationMismatchDTO;
import com.multivendor.ecommercebackend.model.Order;
import com.multivendor.ecommercebackend.model.Payment;
import com.multivendor.ecommercebackend.model.ReconciliationLog;
import com.multivendor.ecommercebackend.model.enums.OrderStatus;
import com.multivendor.ecommercebackend.model.enums.PaymentStatus;
import com.multivendor.ecommercebackend.repository.OrderRepository;
import com.multivendor.ecommercebackend.repository.PaymentRepository;
import com.multivendor.ecommercebackend.repository.ReconciliationLogRepository;
import com.multivendor.ecommercebackend.service.PaymentService;
import com.multivendor.ecommercebackend.service.ReconciliationService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReconciliationServiceImpl implements ReconciliationService {

    private final PaymentService paymentService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ReconciliationLogRepository reconciliationLogRepository;

    /* =========================================
       CORE RECONCILIATION LOGIC
    ========================================== */

    @Override
    public void reconcileOrders() {

        List<Order> orders = orderRepository.findAll();

        for (Order order : orders) {

            Payment payment = paymentRepository
                    .findTopByOrderIdOrderByCreatedAtDesc(order.getId())
                    .orElse(null);

            if (payment == null) continue;

            try {

                // 🔥 Fetch Stripe as source of truth
                PaymentIntent stripeIntent = PaymentIntent.retrieve(
                        payment.getGatewayPaymentId()
                );

                String stripeStatus = stripeIntent.getStatus();

                /*
                 ====================================================
                 CASE 1: Stripe SUCCESS but Order FAILED
                 → Auto Refund
                 ====================================================
                */
                if ("succeeded".equals(stripeStatus)
                        && order.getStatus() == OrderStatus.FAILED
                        && payment.getStatus() == PaymentStatus.SUCCESS) {

                    paymentService.refundPayment(payment.getGatewayPaymentId());

                    order.setStatus(OrderStatus.REFUNDED);
                    orderRepository.save(order);

                    saveLog(order, payment,
                            "Stripe succeeded but order marked FAILED",
                            "Auto refund issued");
                }

                /*
                 ====================================================
                 CASE 2: Stripe FAILED but Order PAID
                 → Correct Order
                 ====================================================
                */
                else if (!"succeeded".equals(stripeStatus)
                        && order.getStatus() == OrderStatus.PAID) {

                    order.setStatus(OrderStatus.FAILED);
                    orderRepository.save(order);

                    saveLog(order, payment,
                            "Order marked PAID but Stripe failed",
                            "Order corrected to FAILED");
                }

                /*
                 ====================================================
                 CASE 3: Stripe SUCCESS but Order not updated
                 → Correct Order
                 ====================================================
                */
                else if ("succeeded".equals(stripeStatus)
                        && order.getStatus() != OrderStatus.PAID
                        && order.getStatus() != OrderStatus.REFUNDED) {

                    order.setStatus(OrderStatus.PAID);
                    orderRepository.save(order);

                    saveLog(order, payment,
                            "Payment succeeded but order not updated",
                            "Order corrected to PAID");
                }

            } catch (StripeException e) {
                // Never crash reconciliation job
                saveLog(order, payment,
                        "Stripe fetch failed",
                        "Reconciliation skipped due to Stripe error");
                log.error("Stripe error for PaymentIntent: {}", payment.getGatewayPaymentId(), e);
            }
        }
    }

    /* =========================================
       SAVE LOG
    ========================================== */

    private void saveLog(Order order,
                         Payment payment,
                         String issue,
                         String action) {

        ReconciliationLog log = new ReconciliationLog();

        log.setOrderId(order.getId());
        log.setPaymentId(payment.getId());
        log.setIssue(issue);
        log.setActionTaken(action);
        log.setStatus("RESOLVED");
        log.setDetectedAt(LocalDateTime.now());
        log.setResolvedAt(LocalDateTime.now());
        log.setUsername(order.getUsername()); // SaaS isolation

        reconciliationLogRepository.save(log);
    }

    /* =========================================
       SaaS SAFE FETCH
    ========================================== */

    @Override
    public List<ReconciliationMismatchDTO> getAllMismatches() {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        boolean isAdmin = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<ReconciliationLog> logs;

        if (isAdmin) {
            logs = reconciliationLogRepository.findAll();
        } else {
            logs = reconciliationLogRepository.findByUsername(username);
        }

        return logs.stream()
                .map(log -> new ReconciliationMismatchDTO(
                        log.getId(),
                        log.getOrderId(),
                        log.getPaymentId(),
                        log.getIssue(),
                        log.getDetectedAt(),
                        log.getStatus(),
                        log.getActionTaken()
                ))
                .toList();
    }
}