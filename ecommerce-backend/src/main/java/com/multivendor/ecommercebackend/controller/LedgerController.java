package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.model.LedgerEntry;
import com.multivendor.ecommercebackend.service.LedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @GetMapping
    public List<LedgerEntry> getLedgerEntries() {
        return ledgerService.getLedgerEntries();
    }
}
