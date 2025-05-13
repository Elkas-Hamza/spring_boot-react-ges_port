package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.PerformanceAlert;
import com.hamzaelkasmi.stage.model.PerformanceMetrics;
import com.hamzaelkasmi.stage.model.SystemMetrics;
import com.hamzaelkasmi.stage.service.PerformanceMonitoringService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for performance monitoring endpoints
 */
@RestController
@RequestMapping("/api/monitoring")
public class PerformanceMonitoringController {
    private static final Logger logger = LoggerFactory.getLogger(PerformanceMonitoringController.class);
    
    private final PerformanceMonitoringService monitoringService;
    
    public PerformanceMonitoringController(PerformanceMonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }
    
    /**
     * Get current system metrics (CPU, memory, etc.)
     */
    @GetMapping("/system-metrics")
    public ResponseEntity<SystemMetrics> getSystemMetrics() {
        logger.debug("API call: GET system metrics");
        return ResponseEntity.ok(monitoringService.getSystemMetrics());
    }
    
    /**
     * Get performance metrics (response times, error rates, etc.)
     */
    @GetMapping("/performance-metrics")
    public ResponseEntity<PerformanceMetrics> getPerformanceMetrics() {
        logger.debug("API call: GET performance metrics");
        return ResponseEntity.ok(monitoringService.getPerformanceMetrics());
    }
    
    /**
     * Get performance alerts
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<PerformanceAlert>> getAlerts() {
        logger.debug("API call: GET performance alerts");
        return ResponseEntity.ok(monitoringService.getAlerts());
    }
    
    /**
     * Clear performance alerts
     */
    @DeleteMapping("/alerts")
    public ResponseEntity<Void> clearAlerts() {
        logger.debug("API call: DELETE performance alerts");
        monitoringService.clearAlerts();
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Enable or disable monitoring
     */
    @PostMapping("/status")
    public ResponseEntity<Map<String, Boolean>> setMonitoringStatus(@RequestBody Map<String, Boolean> status) {
        Boolean enabled = status.get("enabled");
        if (enabled == null) {
            return ResponseEntity.badRequest().build();
        }
        
        if (enabled) {
            logger.info("Enabling performance monitoring");
            monitoringService.enableMonitoring();
        } else {
            logger.info("Disabling performance monitoring");
            monitoringService.disableMonitoring();
        }
        
        return ResponseEntity.ok(Map.of("enabled", monitoringService.isMonitoringEnabled()));
    }
    
    /**
     * Get monitoring status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getMonitoringStatus() {
        logger.debug("API call: GET monitoring status");
        return ResponseEntity.ok(Map.of("enabled", monitoringService.isMonitoringEnabled()));
    }
}
