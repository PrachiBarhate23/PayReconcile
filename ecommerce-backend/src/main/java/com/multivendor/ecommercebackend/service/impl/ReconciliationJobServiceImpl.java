package com.multivendor.ecommercebackend.service.impl;

import com.multivendor.ecommercebackend.model.ReconciliationJob;
import com.multivendor.ecommercebackend.model.enums.JobStatus;
import com.multivendor.ecommercebackend.repository.ReconciliationJobRepository;
import com.multivendor.ecommercebackend.service.ReconciliationJobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReconciliationJobServiceImpl implements ReconciliationJobService {

    private final ReconciliationJobRepository jobRepository;

    @Override
    public void createOrUpdateJob(String orderId, String paymentId, String username) {
        ReconciliationJob job = jobRepository.findByOrderId(orderId).orElse(new ReconciliationJob());

        job.setOrderId(orderId);
        
        if (paymentId != null) {
            job.setPaymentId(paymentId);
        }
        
        if (username != null) {
            job.setUsername(username);
        }

        job.setStatus(JobStatus.PENDING);
        job.setRetryCount(0);
        // Add a slight delay (1 min) before picking up to allow for webhooks/sync to finish normally
        job.setNextRetryAt(LocalDateTime.now().plusMinutes(1)); 

        if (job.getId() == null) {
            job.setCreatedAt(LocalDateTime.now());
        }
        job.setUpdatedAt(LocalDateTime.now());

        jobRepository.save(job);
        log.info("Created/Updated Reconciliation Job for Order: {}", orderId);
    }
}
