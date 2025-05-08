package com.hamzaelkasmi.stage.dto.analytics;

/**
 * Using Java records as a modern alternative to Lombok
 */
public record AnalyticsDTO(
    SummaryDTO summary,
    OperationsByTypeDTO[] operationsByType,
    OperationsByMonthDTO[] operationsByMonth,
    OperationDurationsDTO operationDurations,
    TopEquipeDTO[] topEquipesByOperations,
    PersonnelUtilizationDTO personnelUtilization,
    ArretsByReasonDTO[] arretsByReason,
    PortUtilizationDTO portUtilization,
    RecentEscaleDTO[] recentEscales
) {
    // Default constructor for JSON deserialization
    public AnalyticsDTO() {
        this(
            new SummaryDTO(),
            new OperationsByTypeDTO[0],
            new OperationsByMonthDTO[0],
            new OperationDurationsDTO(),
            new TopEquipeDTO[0],
            new PersonnelUtilizationDTO(),
            new ArretsByReasonDTO[0],
            new PortUtilizationDTO(),
            new RecentEscaleDTO[0]
        );
    }
} 