package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.model.Order;
import java.util.List;

public interface OrderService {

    Order createOrder(
            String username,
            String productName,
            int quantity,
            double amount
    );

    List<Order> getAllOrders();

    Order getOrderById(String orderId);

    Order markPaymentPending(String orderId);

    Order markOrderPaid(String orderId);

    Order markOrderFailed(String orderId);

    Order markOrderRefunded(String orderId);

    double getOrderAmount(String orderId);

    Order save(Order order);
}
