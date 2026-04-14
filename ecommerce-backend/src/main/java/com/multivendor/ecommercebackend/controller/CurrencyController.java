package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.service.CurrencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/currency")
public class CurrencyController {

    @Autowired
    private CurrencyService currencyService;

    @GetMapping("/convert")
    public ResponseEntity<ConversionResponse> convertCurrency(
            @RequestParam Double amount,
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency) {

        Double convertedAmount = currencyService.convertCurrency(amount, fromCurrency, toCurrency);
        return ResponseEntity.ok(new ConversionResponse(amount, fromCurrency, convertedAmount, toCurrency));
    }

    @GetMapping("/rate")
    public ResponseEntity<Double> getExchangeRate(
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency) {

        Double rate = currencyService.getExchangeRate(fromCurrency, toCurrency);
        return ResponseEntity.ok(rate);
    }

    @GetMapping("/rates")
    public ResponseEntity<Map<String, Double>> getAllRates() {
        return ResponseEntity.ok(currencyService.getAllExchangeRates());
    }

    @GetMapping("/default")
    public ResponseEntity<String> getDefaultCurrency() {
        return ResponseEntity.ok(currencyService.getDefaultCurrency());
    }

    static class ConversionResponse {
        public Double sourceAmount;
        public String sourceCurrency;
        public Double convertedAmount;
        public String targetCurrency;

        public ConversionResponse(Double sourceAmount, String sourceCurrency, 
                                 Double convertedAmount, String targetCurrency) {
            this.sourceAmount = sourceAmount;
            this.sourceCurrency = sourceCurrency;
            this.convertedAmount = convertedAmount;
            this.targetCurrency = targetCurrency;
        }
    }
}
