package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.ApiCallMetric;
import com.hamzaelkasmi.stage.model.PerformanceAlert;
import com.hamzaelkasmi.stage.model.PerformanceMetrics;
import com.hamzaelkasmi.stage.model.SystemMetrics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Primary;
import java.util.List;
import java.lang.management.OperatingSystemMXBean;
import java.util.ArrayList;
import java.nio.file.FileStore;
import java.nio.file.FileSystems;

/**
 * Service for monitoring system performance.
 * This service provides real-time metrics about system resources,
 * API performance, and application health.
 */

@Service("hamzaServicePerformanceMonitoring")
@Primary
public class PerformanceMonitoringService {
    private static final Logger logger = LoggerFactory.getLogger(PerformanceMonitoringService.class);

    public PerformanceMonitoringService() {
        logger.info("Performance Monitoring Service initialized");
    }

    /**
     * Check if monitoring is enabled
     */
    public boolean isMonitoringEnabled() {
        // For now, always return true. In a production environment,
        // this could check a configuration property or database setting
        return true;
    }

    /**
     * Enable performance monitoring
     */
    public void enableMonitoring() {
        logger.info("Performance monitoring enabled");
        // In a real implementation, this would turn on data collection
    }

    /**
     * Disable performance monitoring
     */
    public void disableMonitoring() {
        logger.info("Performance monitoring disabled");
        // In a real implementation, this would turn off data collection
    }

    /**
     * Record an API call for monitoring
     */
    public void recordApiCall(String endpoint, long responseTime, boolean isSuccessful) {
        // Implement real logic here
    }

    /**
     * Record an API call for monitoring
     */
    public void recordApiCall(ApiCallMetric metric) {
        // Implement real logic here
    }

    /**
     * Get current performance metrics
     */
    public PerformanceMetrics getPerformanceMetrics() {
        // Implement real logic here
        return new PerformanceMetrics();
    }

    /**
     * Get system metrics
     */    public SystemMetrics getSystemMetrics() {
        SystemMetrics metrics = new SystemMetrics();
        try {
            // Get operating system bean for CPU information
            OperatingSystemMXBean osBean = java.lang.management.ManagementFactory.getOperatingSystemMXBean();
            double cpu = getSystemCpuLoad(osBean);
            metrics.setCpu(cpu);
            
            // Get memory usage with safety checks
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            
            // If maxMemory is Long.MAX_VALUE, the JVM doesn't have a memory limit
            if (maxMemory == Long.MAX_VALUE) {
                // Use total memory as a baseline instead
                maxMemory = totalMemory;
            }
            
            // Calculate used memory and ensure it's never negative
            long usedMemory = totalMemory - freeMemory;
            
            // Sanity check - if calculations are invalid, provide reasonable defaults
            if (maxMemory <= 0 || usedMemory < 0) {
                logger.warn("Invalid memory measurements detected. Using default values.");
                metrics.setMemory(25.0); // Reasonable default memory usage
            } else {
                double memoryUsage = ((double)usedMemory / maxMemory) * 100;
                // Cap at 100% as a safeguard
                if (memoryUsage > 100) {
                    memoryUsage = 99.5;
                }
                metrics.setMemory(memoryUsage);
            }
            
            // Set disk space
            metrics.setDiskSpace(getDiskSpaceInfo());
            
            // Set active connections (simulate with a reasonable number)
            metrics.setActiveConnections(5); // Simulated count of active connections
            
            // Set uptime from JVM runtime
            long uptime = java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime() / 1000; // convert to seconds
            metrics.setUptime(uptime);
            
            // Set current timestamp
            metrics.setTimestamp(java.time.Instant.now());
        } catch (Exception e) {
            logger.error("Error getting system metrics", e);
            // Set default values in case of error
            metrics.setCpu(0);
            metrics.setMemory(0);
            metrics.setDiskSpace(new SystemMetrics.DiskSpace(100000, 50000, 50000));
            metrics.setActiveConnections(0);
            metrics.setUptime(0);
        }
        return metrics;
    }

    /**
     * Get all alerts
     */
    public List<PerformanceAlert> getAlerts() {
        // Implement real logic here
        return new ArrayList<>();
    }

    public void clearAlerts() {
    }
    private SystemMetrics convertSystemMetrics(com.hamzaelkasmi.stage.model.SystemMetrics source) {
        SystemMetrics result = new SystemMetrics();
        return result;
    }

    private double getSystemCpuLoad(OperatingSystemMXBean osBean) {
        try {
            java.lang.reflect.Method method = osBean.getClass().getDeclaredMethod("getCpuLoad");
            method.setAccessible(true);
            double cpuLoad = (double) method.invoke(osBean);
            
            if (cpuLoad >= 0.0) {
                return cpuLoad * 100; 
            }
            
            try {
                method = osBean.getClass().getDeclaredMethod("getSystemCpuLoad");
                method.setAccessible(true);
                cpuLoad = (double) method.invoke(osBean);
                if (cpuLoad >= 0.0) {
                    return cpuLoad * 100; 
                }
            } catch (Exception ex) {
               
            }
            
            // If both methods failed, try with getProcessCpuLoad
            try {
                method = osBean.getClass().getDeclaredMethod("getProcessCpuLoad");
                method.setAccessible(true);
                cpuLoad = (double) method.invoke(osBean);
                if (cpuLoad >= 0.0) {
                    return cpuLoad * 100; 
                }
            } catch (Exception ex) {
                logger.warn("Failed to get CPU load using getProcessCpuLoad: " + ex.getMessage());
            }
            
            double systemLoadAvg = osBean.getSystemLoadAverage();
            if (systemLoadAvg >= 0) {
                int processors = osBean.getAvailableProcessors();
                return (systemLoadAvg / processors) * 100;
            }
            
            return 15.0;
        } catch (Exception e) {
            logger.warn("Failed to get CPU load: " + e.getMessage());
            return 15.0;
        }
    }

    private SystemMetrics.DiskSpace getDiskSpaceInfo() {
        SystemMetrics.DiskSpace diskSpace = new SystemMetrics.DiskSpace();
        try {
            FileStore store = FileSystems.getDefault().getFileStores().iterator().next();
            long total = store.getTotalSpace() / (1024 * 1024); // Convert to MB
            long free = store.getUsableSpace() / (1024 * 1024);
            long used = total - free;

            diskSpace.setTotal(total);
            diskSpace.setUsed(used);
            diskSpace.setFree(free);
        } catch (Exception e) {
            logger.error("Error getting disk space info", e);
            diskSpace.setTotal(500000);
            diskSpace.setUsed(250000);
            diskSpace.setFree(250000);
        }
        return diskSpace;
    }

    private String formatMs(double ms) {
        if (ms < 1000) return String.format("%.0f ms", ms);
        return String.format("%.2f s", ms / 1000);
    }

    @Scheduled(fixedRate = 3000000) // Every minute
    public void checkAndCleanupOldData() {
        if (!isMonitoringEnabled()) return;

        // Clean up old data that's beyond our retention window
        // This would be more sophisticated in a production environment
        logger.debug("Running scheduled cleanup of old performance data");
    }
}
