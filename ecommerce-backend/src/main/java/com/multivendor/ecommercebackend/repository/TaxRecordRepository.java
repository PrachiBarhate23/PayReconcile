package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.TaxRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaxRecordRepository extends MongoRepository<TaxRecord, String> {
    Optional<TaxRecord> findByTransactionId(String transactionId);
    List<TaxRecord> findByOrderId(String orderId);
    List<TaxRecord> findByCountry(String country);
}
