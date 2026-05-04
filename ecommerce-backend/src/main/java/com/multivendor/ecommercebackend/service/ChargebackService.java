package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.model.Chargeback;
import com.multivendor.ecommercebackend.model.User;
import com.multivendor.ecommercebackend.repository.ChargebackRepository;
import com.multivendor.ecommercebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.google.gson.Gson;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ChargebackService {

    @Autowired
    private ChargebackRepository chargebackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private PushNotificationService pushNotificationService;

    private final Gson gson = new Gson();

    public Chargeback initiateChargeback(String paymentId, String orderId, String userId, 
                                         Double amount, String reason) {
        Chargeback chargeback = new Chargeback();
        chargeback.setChargebackId("CB-" + UUID.randomUUID().toString());
        chargeback.setPaymentId(paymentId);
        chargeback.setOrderId(orderId);
        chargeback.setUserId(userId);
        chargeback.setChargebackAmount(amount);
        chargeback.setReason(reason);
        chargeback.setStatus("INITIATED");

        Chargeback saved = chargebackRepository.save(chargeback);

        // Publish to Kafka (Wrapped in try-catch so it doesn't crash if your local Kafka server is down)
        try {
            kafkaTemplate.send("audit-logs", gson.toJson(saved));
        } catch (Exception e) {
            log.warn("Kafka broker not running locally - skipping audit log publish.");
        }

        // Send notifications
        Optional<User> userOpt = userRepository.findById(userId);
        String targetEmail = "prachi.barhate23@spit.ac.in";
        String targetPhone = "+919422989616";

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
                targetEmail = user.getEmail();
            }
            if (user.getPhoneNumber() != null && !user.getPhoneNumber().trim().isEmpty()) {
                targetPhone = user.getPhoneNumber();
            }
        }
        
        // Guaranteed execution out of the if block
        emailService.sendChargebackNotification(targetEmail, saved.getChargebackId(), reason);
        smsService.sendChargebackAlertSms(targetPhone, saved.getChargebackId());
        pushNotificationService.sendChargebackNotification("demo-device-token", saved.getChargebackId(), reason);

        log.info("Chargeback initiated: {}", saved.getChargebackId());
        return saved;
    }

    public Chargeback getChargeback(String chargebackId) {
        return chargebackRepository.findByChargebackId(chargebackId).orElse(null);
    }

    public List<Chargeback> getAllChargebacks() {
        return chargebackRepository.findAll();
    }

    public List<Chargeback> getChargebacksByStatus(String status) {
        return chargebackRepository.findByStatus(status);
    }

    public List<Chargeback> getChargebacksByUser(String userId) {
        return chargebackRepository.findByUserId(userId);
    }

    public Chargeback updateChargebackStatus(String chargebackId, String newStatus, String resolution) {
        Chargeback chargeback = chargebackRepository.findByChargebackId(chargebackId)
                .orElse(null);
        if (chargeback == null) {
            return null;
        }

        chargeback.setStatus(newStatus);
        chargeback.setResolution(resolution);
        if (!newStatus.equals("INITIATED")) {
            chargeback.setResolvedAt(LocalDateTime.now());
        }

        Chargeback saved = chargebackRepository.save(chargeback);
        log.info("Chargeback status updated: {} -> {}", chargebackId, newStatus);
        return saved;
    }

    public Chargeback addEvidenceToChargeback(String chargebackId, String evidence) {
        Chargeback chargeback = chargebackRepository.findByChargebackId(chargebackId)
                .orElse(null);
        if (chargeback == null) {
            return null;
        }

        chargeback.setEvidence(evidence);
        chargeback.setStatus("UNDER_REVIEW");

        Chargeback saved = chargebackRepository.save(chargeback);
        log.info("Evidence added to chargeback: {}", chargebackId);
        return saved;
    }

    public Long getActiveChargebackCount() {
        return (long) chargebackRepository.findByStatus("INITIATED").size();
    }

    public Double getTotalChargebackAmount() {
        return chargebackRepository.findAll().stream()
                .filter(c -> !c.getStatus().equals("LOST"))
                .mapToDouble(Chargeback::getChargebackAmount)
                .sum();
    }
}
