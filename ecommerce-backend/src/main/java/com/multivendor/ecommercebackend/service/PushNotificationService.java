package com.multivendor.ecommercebackend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PushNotificationService {

    public void sendNotification(String deviceToken, String title, String message) {
        try {
            Message msg = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(message)
                            .build())
                    .setToken(deviceToken)
                    .build();

            String response = FirebaseMessaging.getInstance().send(msg);
            log.info("Push notification sent. Message ID: {}", response);
        } catch (Exception e) {
            log.error("Failed to send push notification to device: {}", deviceToken, e);
        }
    }

    public void sendPaymentNotification(String deviceToken, String amount, String transactionId) {
        String title = "Payment Confirmed";
        String message = "Payment of " + amount + " has been confirmed. Transaction ID: " + transactionId;
        sendNotification(deviceToken, title, message);
    }

    public void sendSettlementNotification(String deviceToken, String amount) {
        String title = "Settlement Processed";
        String message = "Your settlement of " + amount + " has been processed and is on its way.";
        sendNotification(deviceToken, title, message);
    }

    public void sendChargebackNotification(String deviceToken, String chargebackId, String reason) {
        String title = "Chargeback Alert";
        String message = "A chargeback has been initiated. Reason: " + reason;
        sendNotification(deviceToken, title, message);
    }

    public void sendMismatchAlertNotification(String deviceToken, String transactionId) {
        String title = "Transaction Mismatch Detected";
        String message = "A mismatch has been detected for transaction: " + transactionId + ". " +
                "Automatic reconciliation is in progress.";
        sendNotification(deviceToken, title, message);
    }

    public void sendSecurityAlertNotification(String deviceToken, String activity) {
        String title = "Security Alert";
        String message = "Unusual activity detected: " + activity;
        sendNotification(deviceToken, title, message);
    }
}
