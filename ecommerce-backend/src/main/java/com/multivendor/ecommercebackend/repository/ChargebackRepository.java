package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.Chargeback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargebackRepository extends MongoRepository<Chargeback, String> {
    Optional<Chargeback> findByChargebackId(String chargebackId);
    Optional<Chargeback> findByPaymentId(String paymentId);
    List<Chargeback> findByStatus(String status);
    List<Chargeback> findByUserId(String userId);
}
