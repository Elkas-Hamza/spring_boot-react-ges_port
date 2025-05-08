package com.hamzaelkasmi.stage.dto.analytics;

import java.time.LocalDateTime;

/**
 * Using Java records as a modern alternative to Lombok
 */
public record RecentEscaleDTO(
    String id,
    String navire,
    String status,
    LocalDateTime arrivee,
    LocalDateTime depart,
    int operations,
    int completedOperations
) {
    // Default constructor for JSON deserialization
    public RecentEscaleDTO() {
        this(null, null, null, null, null, 0, 0);
    }
} 