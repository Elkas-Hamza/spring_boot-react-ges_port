package com.hamzaelkasmi.stage.service.impl;

import com.hamzaelkasmi.stage.dto.analytics.*;
import com.hamzaelkasmi.stage.model.*;
import com.hamzaelkasmi.stage.repository.*;
import com.hamzaelkasmi.stage.service.AnalyticsService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OperationRepository operationRepository;
    private final EscaleRepository escaleRepository;
    private final EquipeRepository equipeRepository;
    private final PersonnelRepository personnelRepository;
    private final ArretRepository arretRepository;
    private final ConteneureRepository conteneureRepository;
    
    // Constructor with all required dependencies
    public AnalyticsServiceImpl(
            OperationRepository operationRepository, 
            EscaleRepository escaleRepository,
            EquipeRepository equipeRepository,
            PersonnelRepository personnelRepository,
            ArretRepository arretRepository,
            ConteneureRepository conteneureRepository) {
        this.operationRepository = operationRepository;
        this.escaleRepository = escaleRepository;
        this.equipeRepository = equipeRepository;
        this.personnelRepository = personnelRepository;
        this.arretRepository = arretRepository;
        this.conteneureRepository = conteneureRepository;
    }

    @Override
    public AnalyticsDTO getAllAnalytics() {
        // Create a new AnalyticsDTO with all components
        return new AnalyticsDTO(
            getSummaryData(),
            getOperationsByType(),
            getOperationsByMonth(Year.now().getValue()),
            getOperationDurations(),
            getTopEquipes(),
            getPersonnelUtilization(),
            getArretsByReason(),
            getPortUtilization(),
            getRecentEscales()
        );
    }

    @Override
    public SummaryDTO getSummaryData() {
        // Count total operations
        long totalOperations = operationRepository.count();
        
        // Count completed operations
        long completedOperations = operationRepository.countByStatus("TERMINEE");
        
        // Count total escales
        long totalEscales = escaleRepository.count();
        
        // Count active escales
        long activeEscales = escaleRepository.countByStatus("EN_COURS");
        
        // Count total equipes
        long totalEquipes = equipeRepository.count();
        
        // Count total personnel
        long totalPersonnel = personnelRepository.count();
        
        return new SummaryDTO(
                (int) totalOperations,
                (int) completedOperations,
                (int) totalEscales,
                (int) activeEscales,
                (int) totalEquipes,
                (int) totalPersonnel
        );
    }

    @Override
    public OperationsByTypeDTO[] getOperationsByType() {
        // Get counts of operations by type
        List<Map<String, Object>> results = operationRepository.countOperationsByType();
        
        return results.stream()
                .map(result -> new OperationsByTypeDTO(
                        (String) result.get("type"),
                        ((Number) result.get("count")).intValue()
                ))
                .toArray(OperationsByTypeDTO[]::new);
    }

    @Override
    public OperationsByMonthDTO[] getOperationsByMonth(Integer year) {
        int targetYear = year != null ? year : Year.now().getValue();
        
        // Get operations counts by month for the specified year
        List<Map<String, Object>> results = operationRepository.countOperationsByMonthForYear(targetYear);
        
        // Create a map for all months (even those with zero operations)
        Map<Integer, Integer> monthCountMap = results.stream()
                .collect(Collectors.toMap(
                        result -> ((Number) result.get("month")).intValue(),
                        result -> ((Number) result.get("count")).intValue()
                ));
        
        // Build the result array with all months
        OperationsByMonthDTO[] monthlyData = new OperationsByMonthDTO[12];
        for (int i = 0; i < 12; i++) {
            String monthName = Month.of(i + 1).toString().substring(0, 3);
            int count = monthCountMap.getOrDefault(i + 1, 0);
            monthlyData[i] = new OperationsByMonthDTO(monthName, count);
        }
        
        return monthlyData;
    }

    @Override
    public OperationDurationsDTO getOperationDurations() {
        // Get all completed operations
        List<Operation> completedOperations = operationRepository.findByStatus("TERMINEE");
        
        // Calculate durations
        List<Integer> durations = completedOperations.stream()
                .filter(op -> op.getDate_debut() != null && op.getDate_fin() != null)
                .map(op -> (int) Duration.between(op.getDate_debut(), op.getDate_fin()).toMinutes())
                .collect(Collectors.toList());
        
        // Calculate average duration
        int averageDuration = durations.isEmpty() ? 0 : 
                durations.stream().mapToInt(Integer::intValue).sum() / durations.size();
        
        // Calculate median duration
        int medianDuration;
        if (durations.isEmpty()) {
            medianDuration = 0;
        } else {
            Collections.sort(durations);
            int middle = durations.size() / 2;
            if (durations.size() % 2 == 0) {
                medianDuration = (durations.get(middle - 1) + durations.get(middle)) / 2;
            } else {
                medianDuration = durations.get(middle);
            }
        }
        
        // Count operations by duration ranges
        Map<String, Integer> durationCounts = new LinkedHashMap<>();
        durationCounts.put("0-60min", 0);
        durationCounts.put("1-2h", 0);
        durationCounts.put("2-4h", 0);
        durationCounts.put("4-8h", 0);
        durationCounts.put(">8h", 0);
        
        for (int duration : durations) {
            if (duration <= 60) {
                durationCounts.put("0-60min", durationCounts.get("0-60min") + 1);
            } else if (duration <= 120) {
                durationCounts.put("1-2h", durationCounts.get("1-2h") + 1);
            } else if (duration <= 240) {
                durationCounts.put("2-4h", durationCounts.get("2-4h") + 1);
            } else if (duration <= 480) {
                durationCounts.put("4-8h", durationCounts.get("4-8h") + 1);
            } else {
                durationCounts.put(">8h", durationCounts.get(">8h") + 1);
            }
        }
        
        // Convert to DTOs
        OperationDurationsDTO.DurationRangeDTO[] durationRanges = durationCounts.entrySet().stream()
                .map(entry -> new OperationDurationsDTO.DurationRangeDTO(entry.getKey(), entry.getValue()))
                .toArray(OperationDurationsDTO.DurationRangeDTO[]::new);
        
        return new OperationDurationsDTO(averageDuration, medianDuration, durationRanges);
    }

    @Override
    public TopEquipeDTO[] getTopEquipes() {
        // Get operations per equipe
        List<Map<String, Object>> operationsPerEquipe = operationRepository.countOperationsByEquipe();
        
        // Create map of equipe ID to operation count
        Map<String, Integer> equipeOperationsMap = operationsPerEquipe.stream()
                .collect(Collectors.toMap(
                        result -> (String) result.get("equipeId"),
                        result -> ((Number) result.get("operationCount")).intValue()
                ));
        
        // Calculate efficiency per equipe (completed / total)
        Map<String, Integer> equipeEfficiencyMap = new HashMap<>();
        for (String equipeId : equipeOperationsMap.keySet()) {
            int totalOps = equipeOperationsMap.get(equipeId);
            int completedOps = operationRepository.countCompletedOperationsByEquipe(equipeId);
            int efficiency = totalOps > 0 ? (int) ((completedOps * 100.0) / totalOps) : 0;
            equipeEfficiencyMap.put(equipeId, efficiency);
        }
        
        // Get equipe information and combine with metrics
        List<Equipe> equipes = equipeRepository.findAll();
        Map<String, String> equipeNamesMap = equipes.stream()
                .collect(Collectors.toMap(
                    Equipe::getId_equipe, 
                    Equipe::getNom_equipe
                ));
        
        // Create DTOs for top equipes
        return equipeOperationsMap.entrySet().stream()
                .map(entry -> {
                    String equipeId = entry.getKey();
                    int operations = entry.getValue();
                    int efficiency = equipeEfficiencyMap.getOrDefault(equipeId, 0);
                    String equipeName = equipeNamesMap.getOrDefault(equipeId, "Unknown");
                    return new TopEquipeDTO(equipeName, operations, efficiency);
                })
                .sorted(Comparator.comparingInt(TopEquipeDTO::operations).reversed())
                .limit(5)
                .toArray(TopEquipeDTO[]::new);
    }

    @Override
    public PersonnelUtilizationDTO getPersonnelUtilization() {
        // For a real implementation, this would calculate the percentage of time personnel are assigned to operations
        // This is a simplified example using random values for demonstration
        
        List<String> departments = Arrays.asList("Opérations", "Maintenance", "Administration", "Sécurité");
        Random random = new Random();
        
        // Calculate average across all personnel (simplified)
        int overallAverage = random.nextInt(15) + 75; // Random between 75-90
        
        // Calculate by department (simplified)
        PersonnelUtilizationDTO.DepartmentUtilizationDTO[] byDepartment = departments.stream()
                .map(dept -> {
                    int utilization = overallAverage + random.nextInt(11) - 5; // Random +/- 5 from average
                    utilization = Math.min(95, Math.max(70, utilization)); // Clamp between 70-95
                    return new PersonnelUtilizationDTO.DepartmentUtilizationDTO(dept, utilization);
                })
                .toArray(PersonnelUtilizationDTO.DepartmentUtilizationDTO[]::new);
        
        return new PersonnelUtilizationDTO(overallAverage, byDepartment);
    }

    @Override
    public ArretsByReasonDTO[] getArretsByReason() {
        // Get arrets grouped by reason
        List<Map<String, Object>> arretsByReason = arretRepository.countAndSumHoursByReason();
        
        // Convert to DTOs
        return arretsByReason.stream()
                .map(result -> new ArretsByReasonDTO(
                        (String) result.get("reason"),
                        ((Number) result.get("count")).intValue(),
                        ((Number) result.get("totalHours")).intValue()
                ))
                .toArray(ArretsByReasonDTO[]::new);
    }

    @Override
    public PortUtilizationDTO getPortUtilization() {
        // For a real implementation, this would calculate port utilization based on container placements
        // This is a simplified example using random values for demonstration
        
        // Calculate total slots and used slots
        int totalSlots = 1000; // Example fixed value
        int occupiedSlots = conteneureRepository.countByEmplacement();
        float currentOccupancy = (float) occupiedSlots / totalSlots;
        
        // Sample zones
        List<String> zones = Arrays.asList("Zone A", "Zone B", "Zone C", "Zone D");
        
        // Generate per-zone statistics
        Random random = new Random();
        PortUtilizationDTO.ZoneUtilizationDTO[] byZone = zones.stream()
                .map(zone -> {
                    int total = totalSlots / zones.size();
                    int available = Math.max(0, total - (int) (currentOccupancy * total * (0.7 + 0.6 * random.nextDouble())));
                    float utilization = (float) (total - available) / total;
                    return new PortUtilizationDTO.ZoneUtilizationDTO(zone, utilization, available, total);
                })
                .toArray(PortUtilizationDTO.ZoneUtilizationDTO[]::new);
        
        return new PortUtilizationDTO(currentOccupancy, occupiedSlots, totalSlots, byZone);
    }

    @Override
    public RecentEscaleDTO[] getRecentEscales() {
        // Get recent escales using PageRequest for the top 5
        List<Escale> recentEscales = escaleRepository.findRecentEscales(PageRequest.of(0, 5));
        
        // Convert to DTOs
        return recentEscales.stream()
                .map(escale -> {
                    int totalOps = operationRepository.countByEscaleId(escale.getNum_escale());
                    int completedOps = operationRepository.countByEscaleIdAndStatus(escale.getNum_escale(), "TERMINEE");
                    
                    String navireNom = escale.getNOM_navire();
                    
                    return new RecentEscaleDTO(
                            escale.getNum_escale(),
                            navireNom,
                            "Active", // Hard-coded for now, should be derived from a status field if available
                            escale.getDATE_accostage(),
                            escale.getDATE_sortie(),
                            totalOps,
                            completedOps
                    );
                })
                .toArray(RecentEscaleDTO[]::new);
    }
}