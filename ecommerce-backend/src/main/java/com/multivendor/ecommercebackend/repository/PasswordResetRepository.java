package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.PasswordReset;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetRepository extends MongoRepository<PasswordReset, String> {
    Optional<PasswordReset> findByToken(String token);
    Optional<PasswordReset> findByEmail(String email);
}
