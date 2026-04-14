package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.LedgerEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface LedgerRepository extends MongoRepository<LedgerEntry, String> {

    List<LedgerEntry> findByUsername(String username);
    List<LedgerEntry> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

}
