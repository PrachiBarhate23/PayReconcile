package com.multivendor.ecommercebackend.repository;

import com.multivendor.ecommercebackend.model.LedgerEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LedgerRepository extends MongoRepository<LedgerEntry, String> {

    List<LedgerEntry> findByUsername(String username);

}
