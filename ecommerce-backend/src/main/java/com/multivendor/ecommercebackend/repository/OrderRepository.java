package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByUsername(String username);

    Optional<Order> findByIdAndUsername(String id, String username);
}
