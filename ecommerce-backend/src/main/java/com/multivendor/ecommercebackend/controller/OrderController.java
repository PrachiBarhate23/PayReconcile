package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.model.Order;
import com.multivendor.ecommercebackend.model.enums.OrderStatus;
import com.multivendor.ecommercebackend.service.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // =========================
    // CREATE ORDER
    // =========================
    @PostMapping
    public Order createOrder(@RequestBody Order order,
                             Authentication authentication) {

        String username = authentication.getName();

        order.setUsername(username);   // 🔥 auto-set from JWT
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.CREATED);

        return orderService.save(order);  // ✅ FIXED
    }

    // =========================
    // GET ORDERS
    // =========================
    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // =========================
    // GET SINGLE ORDER
    // =========================
    @GetMapping("/{orderId}")
    public Order getOrderById(@PathVariable String orderId) {
        return orderService.getOrderById(orderId);
    }
}