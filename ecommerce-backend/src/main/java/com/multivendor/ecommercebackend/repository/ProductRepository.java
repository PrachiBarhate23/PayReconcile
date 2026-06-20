package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategory(String category);
    List<Product> findByFeaturedTrue();
    List<Product> findByInStockTrue();
}
