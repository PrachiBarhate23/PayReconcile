package com.multivendor.ecommercebackend.service.impl;

import com.multivendor.ecommercebackend.model.Order;
import com.multivendor.ecommercebackend.model.enums.OrderStatus;
import com.multivendor.ecommercebackend.repository.OrderRepository;
import com.multivendor.ecommercebackend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    /* =========================
       SECURITY HELPERS (USER APIs ONLY)
    ========================== */

    private Authentication getAuth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private String getCurrentUsername() {
        return getAuth().getName();
    }

    private boolean isAdmin() {
        return getAuth().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    /* =========================
       INTERNAL METHOD (NO SECURITY CHECK)
       Used by Webhooks / System calls
    ========================== */

    private Order getOrderInternal(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    /* =========================
       CREATE ORDER
    ========================== */

    @Override
    public Order createOrder(
            String username,
            String productName,
            int quantity,
            double amount
    ) {
        Order order = new Order();
        order.setUsername(username);
        order.setProductName(productName);
        order.setQuantity(quantity);
        order.setAmount(amount);
        order.setStatus(OrderStatus.CREATED);
        order.setCreatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    /* =========================
       GET ORDERS (WITH SECURITY)
    ========================== */

    @Override
    public List<Order> getAllOrders() {

        if (isAdmin()) {
            return orderRepository.findAll();
        }

        return orderRepository.findByUsername(getCurrentUsername());
    }

    @Override
    public Order getOrderById(String orderId) {

        if (isAdmin()) {
            return orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
        }

        return orderRepository.findByIdAndUsername(
                        orderId,
                        getCurrentUsername()
                )
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    /* =========================
       STATUS UPDATES (WEBHOOK SAFE)
    ========================== */

    @Override
    public Order markPaymentPending(String orderId) {
        Order order = getOrderInternal(orderId);
        order.setStatus(OrderStatus.PAYMENT_PENDING);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Override
    public Order markOrderPaid(String orderId) {
        Order order = getOrderInternal(orderId);
        order.setStatus(OrderStatus.PAID);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Override
    public Order markOrderFailed(String orderId) {
        Order order = getOrderInternal(orderId);
        order.setStatus(OrderStatus.FAILED);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Override
    public Order markOrderRefunded(String orderId) {
        Order order = getOrderInternal(orderId);
        order.setStatus(OrderStatus.REFUNDED);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Override
    public double getOrderAmount(String orderId) {
        return getOrderInternal(orderId).getAmount();
    }

    public Order save(Order order) {
        return orderRepository.save(order);
    }
}