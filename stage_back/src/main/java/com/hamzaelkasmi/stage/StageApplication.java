package com.hamzaelkasmi.stage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.hamzaelkasmi.stage")
public class StageApplication {
    public static void main(String[] args) {
        SpringApplication.run(StageApplication.class, args);
    }
}
