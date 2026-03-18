package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.model.Payment;

import java.util.List;
import java.util.Map;

public interface PaymentService {

    Map<String, String> createStripePaymentIntent(String orderId);

    void handleStripeEvent(String payload, String signature);

    void refundPayment(String paymentIntentId);

    List<Payment> getAllPayments();

    Payment getPaymentById(String paymentId);
    void refundLatestPaymentByOrder(String orderId);

}
