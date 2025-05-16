package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.PerformanceAlert;
import com.hamzaelkasmi.stage.model.PerformanceMetrics;
import com.hamzaelkasmi.stage.model.SystemMetrics;
import com.hamzaelkasmi.stage.service.PerformanceMonitoringService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.util.HashMap;
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
     */    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getMonitoringStatus() {
        logger.debug("API call: GET monitoring status");
        return ResponseEntity.ok(Map.of("enabled", monitoringService.isMonitoringEnabled()));
    }
    
    /**
     * Get system health information
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealthInfo() {
        logger.debug("API call: GET health information");
        Map<String, Object> healthInfo = new HashMap<>();
        
        // Get JVM information
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        
        // System status
        healthInfo.put("status", "UP");
        
        // JVM information
        Map<String, Object> jvmInfo = new HashMap<>();
        jvmInfo.put("uptime", runtimeBean.getUptime());
        jvmInfo.put("vmVendor", runtimeBean.getVmVendor());
        jvmInfo.put("vmName", runtimeBean.getVmName());
        jvmInfo.put("vmVersion", runtimeBean.getVmVersion());
        healthInfo.put("jvm", jvmInfo);
        
        // Memory information
        Map<String, Object> memoryInfo = new HashMap<>();
        memoryInfo.put("heapUsed", memoryBean.getHeapMemoryUsage().getUsed());
        memoryInfo.put("heapMax", memoryBean.getHeapMemoryUsage().getMax());
        double usagePercentage = (double) memoryBean.getHeapMemoryUsage().getUsed() / 
                                 (double) memoryBean.getHeapMemoryUsage().getMax() * 100.0;
        memoryInfo.put("heapUsagePercentage", Math.round(usagePercentage * 100.0) / 100.0);
        healthInfo.put("memory", memoryInfo);
        
        // CPU information
        Map<String, Object> cpuInfo = new HashMap<>();
        cpuInfo.put("availableProcessors", osBean.getAvailableProcessors());
        cpuInfo.put("systemLoadAverage", osBean.getSystemLoadAverage());
        healthInfo.put("cpu", cpuInfo);
        
        // Disk space information (simplified)
        Map<String, Object> diskInfo = new HashMap<>();
        diskInfo.put("free", 10000000000L); // Example values
        diskInfo.put("total", 50000000000L);
        diskInfo.put("usagePercentage", 80.0);
        healthInfo.put("disk", diskInfo);
        
        return ResponseEntity.ok(healthInfo);
    }
}
