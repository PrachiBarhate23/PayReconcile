package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.model.LedgerEntry;

import java.util.List;

public interface LedgerService {

    void recordDebit(String orderId, double amount, String username);
    void recordCredit(String orderId, double amount, String username);
    void recordReversal(String orderId, double amount, String username);
    List<LedgerEntry> getLedgerEntries();   // 🔥 ADD THIS
}
