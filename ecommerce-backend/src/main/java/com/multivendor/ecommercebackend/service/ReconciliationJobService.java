package com.multivendor.ecommercebackend.service;

public interface ReconciliationJobService {

    /**
     * Creates a new reconciliation job or resets an existing one to PENDING.
     * @param orderId the order ID
     * @param paymentId the optional payment ID (can be null if not yet created)
     * @param username the user associated with the transaction
     */
    void createOrUpdateJob(String orderId, String paymentId, String username);
}
