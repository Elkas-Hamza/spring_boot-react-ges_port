package com.hamzaelkasmi.stage.dto.analytics;

/**
 * Using Java records as a modern alternative to Lombok
 */
public record OperationDurationsDTO(
    int averageDuration,
    int medianDuration,
    DurationRangeDTO[] durations
) {
    // Default constructor for JSON deserialization
    public OperationDurationsDTO() {
        this(0, 0, new DurationRangeDTO[0]);
    }

    /**
     * Nested record for duration range data
     */
    public record DurationRangeDTO(
        String range,
        int count
    ) {
        // Default constructor for JSON deserialization
        public DurationRangeDTO() {
            this(null, 0);
        }
    }
} 