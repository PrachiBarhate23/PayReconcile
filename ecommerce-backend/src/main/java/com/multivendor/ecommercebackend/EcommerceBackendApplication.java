package com.multivendor.ecommercebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EcommerceBackendApplication {
    public static void main(String[] args) {
        // Trigger deployment check
        SpringApplication.run(EcommerceBackendApplication.class, args);
    }
}
