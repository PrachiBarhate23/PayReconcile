package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.Entity.WebhookEvent;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface WebhookEventRepository
        extends MongoRepository<WebhookEvent, String> {

    boolean existsById(String id);
    List<WebhookEvent> findByUsername(String username);

}

