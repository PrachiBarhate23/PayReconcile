package com.multivendor.ecommercebackend.controller;

import com.multivendor.ecommercebackend.dto.UserProfileResponse;
import com.multivendor.ecommercebackend.model.User;
import com.multivendor.ecommercebackend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public UserProfileResponse getCurrentUser(Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );
    }
}