package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.model.Settlement;
import com.multivendor.ecommercebackend.model.User;
import com.multivendor.ecommercebackend.repository.SettlementRepository;
import com.multivendor.ecommercebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.google.gson.Gson;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class SettlementService {

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private EmailService emailService;

    private final Gson gson = new Gson();

    public Settlement createSettlement(String settlementId, Double totalAmount, Double taxAmount, 
                                         String currency, List<String> transactionIds) {
        Settlement settlement = new Settlement();
        settlement.setSettlementId(settlementId);
        settlement.setTotalAmount(totalAmount);
        settlement.setTaxAmount(taxAmount);
        settlement.setNetAmount(totalAmount - taxAmount);
        settlement.setCurrency(currency);
        settlement.setTransactionIds(transactionIds);
        settlement.setStatus("PENDING");
        settlement.setSettlementDate(LocalDateTime.now());
        settlement.setStartDate(LocalDateTime.now().withDayOfMonth(1));
        settlement.setEndDate(LocalDateTime.now().with(TemporalAdjusters.lastDayOfMonth()));

        Settlement saved = settlementRepository.save(settlement);

        // Publish to Kafka for async processing
        try {
            kafkaTemplate.send("settlement-jobs", gson.toJson(saved));
        } catch (Exception e) {
            log.warn("Kafka broker not running locally - skipping settlement job publish.");
        }

        log.info("Settlement created: {}", settlementId);
        return saved;
    }

    public Settlement getSettlement(String settlementId) {
        return settlementRepository.findBySettlementId(settlementId).orElse(null);
    }

    public List<Settlement> getAllSettlements() {
        return settlementRepository.findAll();
    }

    public List<Settlement> getSettlementsByStatus(String status) {
        return settlementRepository.findByStatus(status);
    }

    public List<Settlement> getMonthlySettlements(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.with(TemporalAdjusters.lastDayOfMonth());
        return settlementRepository.findByStartDateBetween(start, end);
    }

    public Settlement completeSettlement(String settlementId) {
        Optional<Settlement> settlementOpt = settlementRepository.findBySettlementId(settlementId);
        if (settlementOpt.isEmpty()) {
            return null;
        }

        Settlement settlement = settlementOpt.get();
        settlement.setStatus("COMPLETED");
        settlement.setProcessedAt(LocalDateTime.now());

        Settlement saved = settlementRepository.save(settlement);
        log.info("Settlement completed: {}", settlementId);
        return saved;
    }

    public Double getMonthlySettlementTotal() {
        LocalDateTime start = LocalDateTime.now().withDayOfMonth(1);
        LocalDateTime end = LocalDateTime.now().with(TemporalAdjusters.lastDayOfMonth());
        
        List<Settlement> settlements = settlementRepository.findByStartDateBetween(start, end);
        return settlements.stream()
                .filter(s -> s.getStatus().equals("COMPLETED"))
                .mapToDouble(Settlement::getNetAmount)
                .sum();
    }
}
