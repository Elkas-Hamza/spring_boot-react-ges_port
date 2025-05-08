package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.dto.analytics.*;

public interface AnalyticsService {
    AnalyticsDTO getAllAnalytics();
    SummaryDTO getSummaryData();
    OperationsByTypeDTO[] getOperationsByType();
    OperationsByMonthDTO[] getOperationsByMonth(Integer year);
    OperationDurationsDTO getOperationDurations();
    TopEquipeDTO[] getTopEquipes();
    PersonnelUtilizationDTO getPersonnelUtilization();
    ArretsByReasonDTO[] getArretsByReason();
    PortUtilizationDTO getPortUtilization();
    RecentEscaleDTO[] getRecentEscales();
} 