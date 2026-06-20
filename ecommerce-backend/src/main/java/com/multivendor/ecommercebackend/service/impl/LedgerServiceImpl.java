package com.multivendor.ecommercebackend.service.impl;

import com.multivendor.ecommercebackend.model.LedgerEntry;
import com.multivendor.ecommercebackend.repository.LedgerRepository;
import com.multivendor.ecommercebackend.repository.UserRepository;
import com.multivendor.ecommercebackend.service.LedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LedgerServiceImpl implements LedgerService {

    private final LedgerRepository ledgerRepository;
    private final UserRepository userRepository;

    /* =========================
       Helper Methods
    ========================== */

    private Authentication getAuth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private String getCurrentUsername() {
        return getAuth().getName();
    }

    private boolean isAdmin() {
        return getAuth().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    /* =========================
       Record Entries
    ========================== */

    @Override
    public void recordDebit(String orderId, double amount, String username) {

        ledgerRepository.save(
                LedgerEntry.debit(orderId, amount, orderId, username)
        );

        // When a refund happens (Debit to Admin), the User's wallet gets credited
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setAccountBalance((user.getAccountBalance() != null ? user.getAccountBalance() : 0.0) + amount);
            userRepository.save(user);
        });
    }

    @Override
    public void recordCredit(String orderId, double amount, String username) {

        ledgerRepository.save(
                LedgerEntry.credit(orderId, amount, orderId, username)
        );
    }

    @Override
    public void recordReversal(String orderId, double amount, String username) {

        ledgerRepository.save(
                LedgerEntry.reversal(orderId, amount, orderId, username)
        );

        userRepository.findByUsername(username).ifPresent(user -> {
            user.setAccountBalance((user.getAccountBalance() != null ? user.getAccountBalance() : 0.0) + amount);
            userRepository.save(user);
        });
    }

    /* =========================
       SaaS: Get Ledger
    ========================== */

    @Override
    public List<LedgerEntry> getLedgerEntries() {

        if (isAdmin()) {
            return ledgerRepository.findAll();   // Admin sees all
        }

        return ledgerRepository.findByUsername(getCurrentUsername());  // User sees only theirs
    }
}
