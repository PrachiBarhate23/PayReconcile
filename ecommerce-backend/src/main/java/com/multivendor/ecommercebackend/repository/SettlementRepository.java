package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.Settlement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SettlementRepository extends MongoRepository<Settlement, String> {
    Optional<Settlement> findBySettlementId(String settlementId);
    List<Settlement> findByStatus(String status);
    List<Settlement> findByStartDateBetween(LocalDateTime start, LocalDateTime end);
}
