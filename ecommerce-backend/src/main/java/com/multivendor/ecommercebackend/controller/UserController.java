package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.dto.UserProfileResponse;
import com.multivendor.ecommercebackend.model.User;
import com.multivendor.ecommercebackend.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public UserProfileResponse getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        Double balance = user.getAccountBalance() != null ? user.getAccountBalance() : 0.0;
        // Derive totals from available balance data
        // totalEarnings = all money credited; totalPayouts = money paid out; pendingBalance = in-transit
        Double totalEarnings = balance >= 0 ? balance : 0.0;
        Double totalPayouts = 0.0;
        Double pendingBalance = 0.0;

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                balance,
                totalEarnings,
                totalPayouts,
                pendingBalance,
                user.getPreferredCurrency() != null ? user.getPreferredCurrency() : "USD",
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    // --- Admin User Management Endpoints ---

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User createUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || !user.getRole().startsWith("ROLE_")) {
            user.setRole("ROLE_" + (user.getRole() != null ? user.getRole() : "USER"));
        }
        return userRepository.save(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
    }
}