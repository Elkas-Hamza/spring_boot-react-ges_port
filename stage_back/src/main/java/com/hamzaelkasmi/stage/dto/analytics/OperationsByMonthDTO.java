package com.hamzaelkasmi.stage.dto.analytics;

/**
 * Using Java records as a modern alternative to Lombok
 */
public record OperationsByMonthDTO(
    String month,
    int count
) {
    // Default constructor for JSON deserialization
    public OperationsByMonthDTO() {
        this(null, 0);
    }
} 