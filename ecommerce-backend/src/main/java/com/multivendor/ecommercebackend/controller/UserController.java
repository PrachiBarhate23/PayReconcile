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

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getAccountBalance(),
                user.getPreferredCurrency()
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