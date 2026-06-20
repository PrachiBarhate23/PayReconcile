package com.multivendor.ecommercebackend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String name;
    private String description;
    private double price;
    private String category;
    private String brand;
    private String imageUrl;
    private double rating;
    private int reviewCount;
    private int stockQuantity;
    private boolean inStock;
    private List<String> tags;
    private boolean featured;
    private String badge; // "Best Seller", "New", "Deal", etc.
    private double originalPrice; // for showing discount
    private LocalDateTime createdAt;
}
