package com.multivendor.ecommercebackend.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class CurrencyService {

    // Mock exchange rates (in production, use a real API like Open Exchange Rates)
    private static final Map<String, Double> EXCHANGE_RATES = new HashMap<>();
    static {
        EXCHANGE_RATES.put("USD", 1.0);
        EXCHANGE_RATES.put("EUR", 0.92);
        EXCHANGE_RATES.put("INR", 83.45);
        EXCHANGE_RATES.put("GBP", 0.79);
        EXCHANGE_RATES.put("AUD", 1.52);
        EXCHANGE_RATES.put("CAD", 1.36);
        EXCHANGE_RATES.put("JPY", 149.50);
        EXCHANGE_RATES.put("CNY", 7.09);
    }

    public Double convertCurrency(Double amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) {
            return amount;
        }

        Double fromRate = EXCHANGE_RATES.getOrDefault(fromCurrency, 1.0);
        Double toRate = EXCHANGE_RATES.getOrDefault(toCurrency, 1.0);

        Double amountInUsd = amount / fromRate;
        Double convertedAmount = amountInUsd * toRate;

        log.info("Converted {} {} to {} {}", amount, fromCurrency, convertedAmount, toCurrency);
        return convertedAmount;
    }

    public Double getExchangeRate(String fromCurrency, String toCurrency) {
        Double fromRate = EXCHANGE_RATES.getOrDefault(fromCurrency, 1.0);
        Double toRate = EXCHANGE_RATES.getOrDefault(toCurrency, 1.0);
        return toRate / fromRate;
    }

    public Map<String, Double> getAllExchangeRates() {
        return new HashMap<>(EXCHANGE_RATES);
    }

    public Boolean isSupportedCurrency(String currency) {
        return EXCHANGE_RATES.containsKey(currency);
    }

    public String getDefaultCurrency() {
        return "USD";
    }
}
