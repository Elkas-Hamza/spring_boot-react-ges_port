package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.dto.analytics.*;
import com.hamzaelkasmi.stage.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Analytics API is working!");
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<AnalyticsDTO> getAllAnalytics() {
        return ResponseEntity.ok(analyticsService.getAllAnalytics());
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<SummaryDTO> getSummaryData() {
        return ResponseEntity.ok(analyticsService.getSummaryData());
    }

    @GetMapping("/operations-by-type")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<OperationsByTypeDTO[]> getOperationsByType() {
        return ResponseEntity.ok(analyticsService.getOperationsByType());
    }

    @GetMapping("/operations-by-month")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<OperationsByMonthDTO[]> getOperationsByMonth(
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(analyticsService.getOperationsByMonth(year));
    }

    @GetMapping("/operation-durations")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<OperationDurationsDTO> getOperationDurations() {
        return ResponseEntity.ok(analyticsService.getOperationDurations());
    }

    @GetMapping("/top-equipes")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<TopEquipeDTO[]> getTopEquipes() {
        return ResponseEntity.ok(analyticsService.getTopEquipes());
    }

    @GetMapping("/personnel-utilization")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<PersonnelUtilizationDTO> getPersonnelUtilization() {
        return ResponseEntity.ok(analyticsService.getPersonnelUtilization());
    }

    @GetMapping("/arrets-by-reason")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ArretsByReasonDTO[]> getArretsByReason() {
        return ResponseEntity.ok(analyticsService.getArretsByReason());
    }

    @GetMapping("/port-utilization")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<PortUtilizationDTO> getPortUtilization() {
        return ResponseEntity.ok(analyticsService.getPortUtilization());
    }

    @GetMapping("/recent-escales")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<RecentEscaleDTO[]> getRecentEscales() {
        return ResponseEntity.ok(analyticsService.getRecentEscales());
    }
} 