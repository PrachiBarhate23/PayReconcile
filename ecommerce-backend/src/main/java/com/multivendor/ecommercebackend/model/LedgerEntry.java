package com.multivendor.ecommercebackend.model;

import com.multivendor.ecommercebackend.model.enums.LedgerType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
@Document("ledger")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LedgerEntry {

    @Id
    private String id;
    private String orderId;
    private double amount;
    private LedgerType type;
    private LocalDateTime createdAt;
    private String referenceId;
    private String username;

    public static LedgerEntry debit(String orderId, double amount, String ref, String username) {
        return new LedgerEntry(
                null,
                orderId,
                amount,
                LedgerType.DEBIT,
                LocalDateTime.now(),
                ref,
                username
        );
    }

    public static LedgerEntry credit(String orderId, double amount, String ref, String username) {
        return new LedgerEntry(
                null,
                orderId,
                amount,
                LedgerType.CREDIT,
                LocalDateTime.now(),
                ref,
                username
        );
    }

    public static LedgerEntry reversal(String orderId, double amount, String ref, String username) {
        return new LedgerEntry(
                null,
                orderId,
                amount,
                LedgerType.REVERSAL,
                LocalDateTime.now(),
                ref,
                username
        );
    }
}
