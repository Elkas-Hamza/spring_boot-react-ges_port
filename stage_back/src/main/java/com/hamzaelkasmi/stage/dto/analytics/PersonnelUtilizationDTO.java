package com.hamzaelkasmi.stage.dto.analytics;

/**
 * Using Java records as a modern alternative to Lombok
 */
public record PersonnelUtilizationDTO(
    int average,
    DepartmentUtilizationDTO[] byDepartment
) {
    // Default constructor for JSON deserialization
    public PersonnelUtilizationDTO() {
        this(0, new DepartmentUtilizationDTO[0]);
    }

    /**
     * Nested record for department utilization data
     */
    public record DepartmentUtilizationDTO(
        String department,
        int utilization
    ) {
        // Default constructor for JSON deserialization
        public DepartmentUtilizationDTO() {
            this(null, 0);
        }
    }
} 