package com.hamzaelkasmi.stage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"com.hamzaelkasmi.stage", "com.stage"})
@EnableScheduling
public class StageApplication {
    public static void main(String[] args) {
        SpringApplication.run(StageApplication.class, args);
    }
}
