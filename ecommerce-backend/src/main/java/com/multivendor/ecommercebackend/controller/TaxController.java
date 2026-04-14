package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.model.TaxRecord;
import com.multivendor.ecommercebackend.service.TaxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/taxes")
public class TaxController {

    @Autowired
    private TaxService taxService;

    @PostMapping("/calculate")
    public ResponseEntity<TaxRecord> calculateTax(@RequestParam String transactionId,
                                                   @RequestParam String orderId,
                                                   @RequestParam Double amount,
                                                   @RequestParam String country,
                                                   @RequestParam(required = false) String state) {
        TaxRecord taxRecord = taxService.calculateAndSaveTax(transactionId, orderId, amount, country, state);
        return ResponseEntity.ok(taxRecord);
    }

    @GetMapping("/all")
    public ResponseEntity<List<TaxRecord>> getAllTaxRecords() {
        return ResponseEntity.ok(taxService.getAllTaxRecords());
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TaxRecord> getTaxRecord(@PathVariable String transactionId) {
        TaxRecord record = taxService.getTaxRecord(transactionId);
        if (record != null) {
            return ResponseEntity.ok(record);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/country/{country}/total")
    public ResponseEntity<Double> getTotalTaxByCountry(@PathVariable String country) {
        return ResponseEntity.ok(taxService.getTotalTaxByCountry(country));
    }

    @GetMapping("/order/{orderId}/total")
    public ResponseEntity<Double> getTotalTaxByOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(taxService.getTotalTaxByOrder(orderId));
    }

    @GetMapping("/rates")
    public ResponseEntity<Map<String, String>> getTaxRates() {
        Map<String, String> rates = Map.of(
                "IN", "18% (GST)",
                "US", "8.5% (Sales Tax)",
                "UK", "20% (VAT)",
                "EU", "19% (VAT)",
                "AU", "10% (GST)"
        );
        return ResponseEntity.ok(rates);
    }
}
