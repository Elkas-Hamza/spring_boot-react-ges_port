package com.hamzaelkasmi.stage.dto.analytics;

/**
 * Using Java records as a modern alternative to Lombok
 */
public record TopEquipeDTO(
    String equipe,
    int operations,
    int efficiency
) {
    // Default constructor for JSON deserialization
    public TopEquipeDTO() {
        this(null, 0, 0);
    }
} 