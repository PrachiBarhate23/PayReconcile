package com.multivendor.ecommercebackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${mail.from.address:sahasi.alertas@gmail.com}")
    private String fromAddress;

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom(fromAddress);
            
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
        }
    }

    public void sendPasswordResetEmail(String email, String resetLink) {
        String subject = "Password Reset Request";
        String body = "Dear User,\n\n" +
                "You have requested to reset your password. Click the link below to reset your password:\n\n" +
                resetLink + "\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Regards,\nPayment Reconciliation System";
        
        sendEmail(email, subject, body);
    }

    public void sendAccountConfirmationEmail(String email, String confirmationLink) {
        String subject = "Account Confirmation";
        String body = "Dear User,\n\n" +
                "Welcome to Payment Reconciliation System. Please confirm your email address by clicking the link below:\n\n" +
                confirmationLink + "\n\n" +
                "Regards,\nPayment Reconciliation System";
        
        sendEmail(email, subject, body);
    }

    public void sendSettlementNotification(String email, String settlementAmount, String currency) {
        String subject = "Settlement Processed";
        String body = "Dear User,\n\n" +
                "Your settlement has been processed successfully.\n\n" +
                "Settlement Amount: " + settlementAmount + " " + currency + "\n\n" +
                "Regards,\nPayment Reconciliation System";
        
        sendEmail(email, subject, body);
    }

    public void sendChargebackNotification(String email, String chargebackId, String reason) {
        String subject = "Chargeback Initiated";
        String body = "Dear User,\n\n" +
                "A chargeback has been initiated for transaction: " + chargebackId + "\n" +
                "Reason: " + reason + "\n\n" +
                "Our team will review this and contact you shortly.\n\n" +
                "Regards,\nPayment Reconciliation System";
        
        sendEmail(email, subject, body);
    }
}
