package com.multivendor.ecommercebackend.scheduler;

import com.multivendor.ecommercebackend.service.ReconciliationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReconciliationScheduler {

    private final ReconciliationService reconciliationService;

    // Runs every 5 minutes
    @Scheduled(fixedDelay = 300000)
    public void runReconciliation() {
        reconciliationService.reconcileOrders();
    }
}
