package com.hamzaelkasmi.stage.dto.analytics;

/**
 * Using Java records as a modern alternative to Lombok
 */
public record OperationsByTypeDTO(
    String type,
    int count
) {
    // Default constructor for JSON deserialization
    public OperationsByTypeDTO() {
        this(null, 0);
    }
} 