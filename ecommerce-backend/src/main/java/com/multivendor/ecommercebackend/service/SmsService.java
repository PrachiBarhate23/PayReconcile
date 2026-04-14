package com.multivendor.ecommercebackend.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SmsService {

    public void sendSms(String toPhoneNumber, String messageBody) {
        log.info("SMS Notifications are currently disabled. Would have sent: [{}] to [{}]", messageBody, toPhoneNumber);
    }

    public void sendPaymentConfirmationSms(String phoneNumber, String amount, String currency) {
        String message = "Payment of " + amount + " " + currency + " has been confirmed. " +
                "Transaction ID: " + System.currentTimeMillis();
        sendSms(phoneNumber, message);
    }

    public void sendSettlementSms(String phoneNumber, String settlementAmount, String currency) {
        String message = "Settlement of " + settlementAmount + " " + currency + " has been processed. " +
                "Check your account for details.";
        sendSms(phoneNumber, message);
    }

    public void sendChargebackAlertSms(String phoneNumber, String chargebackId) {
        String message = "Alert: A chargeback has been initiated for transaction: " + chargebackId + ". " +
                "Please review and respond immediately.";
        sendSms(phoneNumber, message);
    }

    public void sendSecurityAlertSms(String phoneNumber, String activity) {
        String message = "Security Alert: Unusual activity detected on your account. Activity: " + activity + ". " +
                "If this wasn't you, please secure your account immediately.";
        sendSms(phoneNumber, message);
    }
}
