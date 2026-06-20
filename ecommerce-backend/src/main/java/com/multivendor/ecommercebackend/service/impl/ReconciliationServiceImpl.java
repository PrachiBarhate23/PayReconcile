package com.multivendor.ecommercebackend.service.impl;

import com.multivendor.ecommercebackend.dto.ReconciliationMismatchDTO;
import com.multivendor.ecommercebackend.model.Order;
import com.multivendor.ecommercebackend.model.Payment;
import com.multivendor.ecommercebackend.model.ReconciliationJob;
import com.multivendor.ecommercebackend.model.ReconciliationLog;
import com.multivendor.ecommercebackend.model.enums.JobStatus;
import com.multivendor.ecommercebackend.model.enums.OrderStatus;
import com.multivendor.ecommercebackend.model.enums.PaymentStatus;
import com.multivendor.ecommercebackend.repository.OrderRepository;
import com.multivendor.ecommercebackend.repository.PaymentRepository;
import com.multivendor.ecommercebackend.repository.ReconciliationJobRepository;
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
    private final ReconciliationJobRepository reconciliationJobRepository;

    /* =========================================
       LEGACY RECONCILIATION LOGIC
    ========================================== */

    @Override
    public void reconcileOrders() {
        processPendingJobs(); // Delegate to new logic
    }

    /* =========================================
       JOB-BASED RECONCILIATION LOGIC
    ========================================== */

    @Override
    public void processPendingJobs() {
        List<ReconciliationJob> pendingJobs = reconciliationJobRepository
                .findByStatusAndNextRetryAtBefore(JobStatus.PENDING, LocalDateTime.now());

        if (!pendingJobs.isEmpty()) {
            log.info("Found {} pending reconciliation jobs", pendingJobs.size());
        }

        for (ReconciliationJob job : pendingJobs) {
            try {
                processJob(job);
            } catch (Exception e) {
                log.error("Failed to process reconciliation job for order {}", job.getOrderId(), e);
                handleJobFailure(job);
            }
        }
    }

    private void processJob(ReconciliationJob job) throws StripeException {
        Order order = orderRepository.findById(job.getOrderId()).orElse(null);
        if (order == null) {
            markJobCompleted(job, "Order not found, skipped");
            return;
        }

        Payment payment = null;
        if (job.getPaymentId() != null) {
            payment = paymentRepository.findById(job.getPaymentId()).orElse(null);
        }
        if (payment == null) {
            payment = paymentRepository.findTopByOrderIdOrderByCreatedAtDesc(order.getId()).orElse(null);
        }

        if (payment == null || payment.getGatewayPaymentId() == null) {
            markJobCompleted(job, "No payment or gateway ID found");
            return;
        }

        // Fetch Stripe as source of truth
        PaymentIntent stripeIntent = PaymentIntent.retrieve(payment.getGatewayPaymentId());
        String stripeStatus = stripeIntent.getStatus();
        boolean mismatchFound = false;

        /* CASE 1: Stripe SUCCESS but Order FAILED -> Auto Refund */
        if ("succeeded".equals(stripeStatus)
                && order.getStatus() == OrderStatus.FAILED
                && payment.getStatus() == PaymentStatus.SUCCESS) {

            paymentService.refundPayment(payment.getGatewayPaymentId());
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            saveLog(order, payment, "Stripe succeeded but order marked FAILED", "Auto refund issued");
            mismatchFound = true;
        }
        /* CASE 2: Stripe FAILED but Order PAID -> Correct Order */
        else if (!"succeeded".equals(stripeStatus) && order.getStatus() == OrderStatus.PAID) {
            order.setStatus(OrderStatus.FAILED);
            orderRepository.save(order);

            saveLog(order, payment, "Order marked PAID but Stripe failed", "Order corrected to FAILED");
            mismatchFound = true;
        }
        /* CASE 3: Stripe SUCCESS but Order not updated -> Correct Order */
        else if ("succeeded".equals(stripeStatus)
                && order.getStatus() != OrderStatus.PAID
                && order.getStatus() != OrderStatus.REFUNDED) {

            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);

            saveLog(order, payment, "Payment succeeded but order not updated", "Order corrected to PAID");
            mismatchFound = true;
        }

        markJobCompleted(job, mismatchFound ? "Mismatch resolved" : "No mismatch");
    }

    private void markJobCompleted(ReconciliationJob job, String note) {
        job.setStatus(JobStatus.COMPLETED);
        job.setUpdatedAt(LocalDateTime.now());
        reconciliationJobRepository.save(job);
        log.info("Job completed for order {}: {}", job.getOrderId(), note);
    }

    private void handleJobFailure(ReconciliationJob job) {
        int nextRetry = job.getRetryCount() + 1;
        job.setRetryCount(nextRetry);
        
        if (nextRetry >= 3) {
            job.setStatus(JobStatus.FAILED);
            job.setNextRetryAt(null);
            log.error("Job permanently failed for order {}", job.getOrderId());
        } else {
            // Exponential backoff
            job.setNextRetryAt(LocalDateTime.now().plusMinutes(5L * nextRetry));
            log.warn("Job retry {} scheduled for order {}", nextRetry, job.getOrderId());
        }
        
        job.setUpdatedAt(LocalDateTime.now());
        reconciliationJobRepository.save(job);
    }

    /* =========================================
       SAVE LOG
    ========================================== */

    private void saveLog(Order order, Payment payment, String issue, String action) {
        ReconciliationLog logEntry = new ReconciliationLog();
        logEntry.setOrderId(order.getId());
        logEntry.setPaymentId(payment.getId());
        logEntry.setIssue(issue);
        logEntry.setActionTaken(action);
        logEntry.setStatus(action.toLowerCase().contains("refund") ? "REFUNDED" : "RESOLVED");
        logEntry.setDetectedAt(LocalDateTime.now());
        logEntry.setResolvedAt(LocalDateTime.now());
        logEntry.setUsername(order.getUsername()); // SaaS isolation

        reconciliationLogRepository.save(logEntry);
    }

    /* =========================================
       SaaS SAFE FETCH
    ========================================== */

    @Override
    public List<ReconciliationMismatchDTO> getAllMismatches() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

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

    /* =========================================
       SIMULATE MISMATCH (DEMO)
    ========================================== */

    @Override
    public java.util.Map<String, String> simulateMismatch() {
        // Find a PAID order that has a SUCCESS payment with a gateway ID
        List<Order> paidOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID)
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .toList();

        for (Order order : paidOrders) {
            Payment payment = paymentRepository
                    .findTopByOrderIdOrderByCreatedAtDesc(order.getId())
                    .orElse(null);

            if (payment != null
                    && payment.getStatus() == PaymentStatus.SUCCESS
                    && payment.getGatewayPaymentId() != null) {

                // Force mismatch: Stripe says SUCCESS but order now says FAILED
                order.setStatus(OrderStatus.FAILED);
                orderRepository.save(order);

                // Ensure a reconciliation job exists so it gets picked up immediately
                reconciliationJobRepository.save(
                        buildJob(order.getId(), payment.getId(), order.getUsername())
                );

                log.info("[DEMO] Forced mismatch on order {} — status set to FAILED", order.getId());
                return java.util.Map.of(
                        "orderId", order.getId(),
                        "message", "Mismatch injected: Stripe shows SUCCESS but order marked FAILED. Reconciler will auto-refund."
                );
            }
        }

        return java.util.Map.of(
                "orderId", "",
                "message", "No eligible PAID order found. Please complete a payment first, then try again."
        );
    }

    private ReconciliationJob buildJob(String orderId, String paymentId, String username) {
        // Check if a PENDING job already exists
        List<ReconciliationJob> existing = reconciliationJobRepository.findAll().stream()
                .filter(j -> j.getOrderId().equals(orderId) && j.getStatus() == JobStatus.PENDING)
                .toList();
        if (!existing.isEmpty()) return existing.get(0);

        ReconciliationJob job = new ReconciliationJob();
        job.setOrderId(orderId);
        job.setPaymentId(paymentId);
        job.setUsername(username);
        job.setStatus(JobStatus.PENDING);
        job.setRetryCount(0);
        job.setNextRetryAt(LocalDateTime.now()); // immediately eligible
        job.setCreatedAt(LocalDateTime.now());
        job.setUpdatedAt(LocalDateTime.now());
        return job;
    }
}