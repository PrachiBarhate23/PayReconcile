package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByGatewayPaymentId(String gatewayPaymentId);

    List<Payment> findByUsername(String username);

    Optional<Payment> findByIdAndUsername(String id, String username);

    // ✅ ADD THIS
    Optional<Payment> findTopByOrderIdOrderByCreatedAtDesc(String orderId);
}
