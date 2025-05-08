package com.hamzaelkasmi.stage.dto.analytics;

/**
 * Using Java records as a modern alternative to Lombok
 */
public record ArretsByReasonDTO(
    String reason,
    int count,
    int totalHours
) {
    // Default constructor for JSON deserialization
    public ArretsByReasonDTO() {
        this(null, 0, 0);
    }
} 