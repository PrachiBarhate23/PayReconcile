package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.ReconciliationJob;
import com.multivendor.ecommercebackend.model.enums.JobStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReconciliationJobRepository extends MongoRepository<ReconciliationJob, String> {

    List<ReconciliationJob> findByStatusAndNextRetryAtBefore(JobStatus status, LocalDateTime nextRetryAt);

    Optional<ReconciliationJob> findByOrderId(String orderId);
    
    List<ReconciliationJob> findByStatus(JobStatus status);
}
