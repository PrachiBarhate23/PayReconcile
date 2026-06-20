package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.dto.ReconciliationMismatchDTO;

import java.util.List;

public interface ReconciliationService {

    void reconcileOrders(); // Legacy method
    
    void processPendingJobs();

    List<ReconciliationMismatchDTO> getAllMismatches();

    java.util.Map<String, String> simulateMismatch();
}
