package com.multivendor.ecommercebackend.model;

import com.multivendor.ecommercebackend.model.enums.OrderStatus;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String username;
    private String productName;
    private int quantity;
    private double amount;
    private String role; // ROLE_USER or ROLE_ADMIN


    private OrderStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
