package com.multivendor.ecommercebackend.service;

import com.multivendor.ecommercebackend.model.PasswordReset;
import com.multivendor.ecommercebackend.model.User;
import com.multivendor.ecommercebackend.repository.PasswordResetRepository;
import com.multivendor.ecommercebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class PasswordResetService {

    @Autowired
    private PasswordResetRepository passwordResetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void initiatePasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByUsername(email);
        if (userOpt.isEmpty()) {
            log.warn("Password reset requested for non-existent email: {}", email);
            return;
        }

        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString();

        PasswordReset resetRecord = new PasswordReset();
        resetRecord.setUserId(user.getId());
        resetRecord.setEmail(email);
        resetRecord.setToken(resetToken);
        resetRecord.setCreatedAt(LocalDateTime.now());
        resetRecord.setExpiresAt(LocalDateTime.now().plusHours(1));

        passwordResetRepository.save(resetRecord);

        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(email, resetLink);

        log.info("Password reset initiated for email: {}", email);
    }

    public Boolean validateResetToken(String token) {
        Optional<PasswordReset> resetOpt = passwordResetRepository.findByToken(token);
        if (resetOpt.isEmpty()) {
            return false;
        }

        PasswordReset reset = resetOpt.get();
        if (reset.getIsUsed()) {
            log.warn("Attempt to use already used reset token");
            return false;
        }

        if (LocalDateTime.now().isAfter(reset.getExpiresAt())) {
            log.warn("Reset token has expired");
            return false;
        }

        return true;
    }

    public Boolean resetPassword(String token, String newPassword) {
        if (!validateResetToken(token)) {
            return false;
        }

        Optional<PasswordReset> resetOpt = passwordResetRepository.findByToken(token);
        if (resetOpt.isEmpty()) {
            return false;
        }

        PasswordReset reset = resetOpt.get();
        Optional<User> userOpt = userRepository.findById(reset.getUserId());
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        reset.setIsUsed(true);
        passwordResetRepository.save(reset);

        log.info("Password reset successful for user: {}", reset.getUserId());
        return true;
    }
}
