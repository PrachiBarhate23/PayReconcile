package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.model.TaxRecord;
import com.multivendor.ecommercebackend.repository.TaxRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class TaxService {

    @Autowired
    private TaxRecordRepository taxRecordRepository;

    @Value("${tax.percentage:18}")
    private Double defaultTaxRate;

    @Value("${tax.country:IN}")
    private String defaultCountry;

    // Tax rate mappings for different countries and regions
    private static final Map<String, Double> TAX_RATES = new HashMap<>();
    static {
        TAX_RATES.put("IN", 18.0);  // GST in India
        TAX_RATES.put("US", 8.5);   // Average sales tax in US
        TAX_RATES.put("UK", 20.0);  // VAT in UK
        TAX_RATES.put("EU", 19.0);  // Average VAT in EU
        TAX_RATES.put("AU", 10.0);  // GST in Australia
    }

    public TaxRecord calculateAndSaveTax(String transactionId, String orderId, Double amount, 
                                         String country, String state) {
        Double taxRate = getTaxRate(country, state);
        Double taxAmount = (amount * taxRate) / 100;

        TaxRecord taxRecord = new TaxRecord();
        taxRecord.setTransactionId(transactionId);
        taxRecord.setOrderId(orderId);
        taxRecord.setTaxableAmount(amount);
        taxRecord.setTaxRate(taxRate);
        taxRecord.setTaxAmount(taxAmount);
        taxRecord.setTaxType(getTaxType(country));
        taxRecord.setCountry(country);
        taxRecord.setState(state);

        TaxRecord saved = taxRecordRepository.save(taxRecord);
        log.info("Tax calculated for transaction: {} Amount: {} Tax Rate: {}%", transactionId, amount, taxRate);
        return saved;
    }

    public Double calculateTax(Double amount, String country) {
        Double taxRate = getTaxRate(country, null);
        return (amount * taxRate) / 100;
    }

    public Double getTaxRate(String country, String state) {
        if (TAX_RATES.containsKey(country)) {
            return TAX_RATES.get(country);
        }
        return defaultTaxRate;
    }

    public String getTaxType(String country) {
        return switch (country) {
            case "IN" -> "GST";
            case "UK", "EU" -> "VAT";
            case "US" -> "SALES_TAX";
            case "AU" -> "GST";
            default -> "TAX";
        };
    }

    public Double getTotalTaxByCountry(String country) {
        List<TaxRecord> records = taxRecordRepository.findByCountry(country);
        return records.stream()
                .mapToDouble(TaxRecord::getTaxAmount)
                .sum();
    }

    public Double getTotalTaxByOrder(String orderId) {
        List<TaxRecord> records = taxRecordRepository.findByOrderId(orderId);
        return records.stream()
                .mapToDouble(TaxRecord::getTaxAmount)
                .sum();
    }

    public TaxRecord getTaxRecord(String transactionId) {
        return taxRecordRepository.findByTransactionId(transactionId).orElse(null);
    }

    public List<TaxRecord> getAllTaxRecords() {
        return taxRecordRepository.findAll();
    }
}
