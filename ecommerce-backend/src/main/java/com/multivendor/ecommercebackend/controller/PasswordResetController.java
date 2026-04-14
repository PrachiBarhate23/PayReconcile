package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.Data;

@RestController
@RequestMapping("/api/password-reset")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        try {
            passwordResetService.initiatePasswordReset(email);
            return ResponseEntity.ok("Password reset link sent to your email");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/validate/{token}")
    public ResponseEntity<Boolean> validateToken(@PathVariable String token) {
        Boolean isValid = passwordResetService.validateResetToken(token);
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/reset/{token}")
    public ResponseEntity<String> resetPassword(@PathVariable String token, 
                                                @RequestBody ResetPasswordRequest request) {
        try {
            Boolean success = passwordResetService.resetPassword(token, request.getNewPassword());
            if (success) {
                return ResponseEntity.ok("Password reset successfully");
            } else {
                return ResponseEntity.badRequest().body("Invalid or expired token");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Data
    static class ResetPasswordRequest {
        private String newPassword;
        private String confirmPassword;
    }
}
