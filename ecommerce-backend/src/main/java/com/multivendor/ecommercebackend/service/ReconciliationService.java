package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.dto.ReconciliationMismatchDTO;

import java.util.List;

public interface ReconciliationService {

    void reconcileOrders();

    List<ReconciliationMismatchDTO> getAllMismatches();
}
