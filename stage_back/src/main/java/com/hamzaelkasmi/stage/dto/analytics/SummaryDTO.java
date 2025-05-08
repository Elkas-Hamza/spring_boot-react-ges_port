package com.hamzaelkasmi.stage.dto.analytics;

/**
 * Using Java records as a modern alternative to Lombok
 * Records automatically provide:
 * - Constructor
 * - Getters (named after the fields)
 * - equals, hashCode, and toString
 */
public record SummaryDTO(
    int totalOperations,
    int completedOperations,
    int totalEscales,
    int activeEscales,
    int totalEquipes,
    int totalPersonnel
) {
    // Default constructor for JSON deserialization
    public SummaryDTO() {
        this(0, 0, 0, 0, 0, 0);
    }
} 