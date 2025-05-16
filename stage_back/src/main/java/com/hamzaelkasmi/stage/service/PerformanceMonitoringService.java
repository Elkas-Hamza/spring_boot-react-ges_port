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
 */

@Service("hamzaServicePerformanceMonitoring")
@Primary
public class PerformanceMonitoringService {
    private static final Logger logger = LoggerFactory.getLogger(PerformanceMonitoringService.class);

    public PerformanceMonitoringService() {
        logger.info("Performance Monitoring Service initialized");
    }

    /**
     * Enable performance monitoring
     */
    public void enableMonitoring() {
        // Implement real logic here
    }

    /**
     * Disable performance monitoring
     */
    public void disableMonitoring() {
        // Implement real logic here
    }

    /**
     * Check if monitoring is enabled
     */
    public boolean isMonitoringEnabled() {
        // Implement real logic here
        return false;
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
            
            // Get memory usage
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long usedMemory = runtime.totalMemory() - runtime.freeMemory();
            double memoryUsage = ((double)usedMemory / maxMemory) * 100;
            metrics.setMemory(memoryUsage);
            
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

    /**
     * Clear all alerts
     */
    public void clearAlerts() {
        // Implement real logic here
    }

    // Helper method to convert between model types
    private SystemMetrics convertSystemMetrics(com.hamzaelkasmi.stage.model.SystemMetrics source) {
        // In a real implementation, convert all properties
        SystemMetrics result = new SystemMetrics();
        return result;
    }

    // Utility methods

    private double getSystemCpuLoad(OperatingSystemMXBean osBean) {
        // Try to use platform-specific method if available
        try {
            java.lang.reflect.Method method = osBean.getClass().getDeclaredMethod("getCpuLoad");
            method.setAccessible(true);
            double cpuLoad = (double) method.invoke(osBean);
            return cpuLoad * 100; // Convert to percentage
        } catch (Exception e) {
            // Fallback to standard method
            return osBean.getSystemLoadAverage() * 100;
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
            // Set default values
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

    @Scheduled(fixedRate = 60000) // Every minute
    public void checkAndCleanupOldData() {
        if (!isMonitoringEnabled()) return;

        // Clean up old data that's beyond our retention window
        // This would be more sophisticated in a production environment
        logger.debug("Running scheduled cleanup of old performance data");
    }
}
