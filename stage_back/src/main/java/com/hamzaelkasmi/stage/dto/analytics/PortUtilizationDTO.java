package com.hamzaelkasmi.stage.dto.analytics;

/**
 * Using Java records as a modern alternative to Lombok
 */
public record PortUtilizationDTO(
    float currentOccupancy,
    int occupiedSlots,
    int totalSlots,
    ZoneUtilizationDTO[] byZone
) {
    // Default constructor for JSON deserialization
    public PortUtilizationDTO() {
        this(0.0f, 0, 0, new ZoneUtilizationDTO[0]);
    }

    /**
     * Nested record for zone utilization data
     */
    public record ZoneUtilizationDTO(
        String zone,
        float utilization,
        int available,
        int total
    ) {
        // Default constructor for JSON deserialization
        public ZoneUtilizationDTO() {
            this(null, 0.0f, 0, 0);
        }
    }
} 