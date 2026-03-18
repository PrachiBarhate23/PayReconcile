package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.ReconciliationLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReconciliationLogRepository
        extends MongoRepository<ReconciliationLog, String> {

    List<ReconciliationLog> findByUsername(String username);
}
