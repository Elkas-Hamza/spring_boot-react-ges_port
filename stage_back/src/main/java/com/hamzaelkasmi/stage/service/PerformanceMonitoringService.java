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
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.nio.file.FileStore;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Service for monitoring system performance.
 * This service provides real-time metrics about system resources,
 * API performance, and application health.
 */

@Service("hamzaServicePerformanceMonitoring")
@Primary
public class PerformanceMonitoringService {
    private static final Logger logger = LoggerFactory.getLogger(PerformanceMonitoringService.class);
    
    // Track active HTTP connections
    private final AtomicInteger activeConnections = new AtomicInteger(0);
    // Track total connections since startup
    private final AtomicInteger totalConnections = new AtomicInteger(0);

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
    }    /**
     * Get system metrics
     */
    public SystemMetrics getSystemMetrics() {
        SystemMetrics metrics = new SystemMetrics();
        try {
            // Get operating system bean for CPU information
            OperatingSystemMXBean osBean = java.lang.management.ManagementFactory.getOperatingSystemMXBean();
            double cpu = getSystemCpuLoad(osBean);
            metrics.setCpu(cpu);
            
            // Get memory usage
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            
            long maxUsableMemory = maxMemory == Long.MAX_VALUE ? totalMemory : maxMemory;
            long usedMemory = totalMemory - freeMemory;
            double memoryUsage = Math.min(((double)usedMemory / maxUsableMemory) * 100, 100.0);
            metrics.setMemory(memoryUsage);
            
            // Set real disk space metrics
            metrics.setDiskSpace(getDiskSpaceInfo());
            
            // Set real active connections count
            metrics.setActiveConnections(getActiveConnectionCount());
            
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
    }    private double getSystemCpuLoad(OperatingSystemMXBean osBean) {
        try {
            double cpuLoad = -1.0;
            
            // First try using the modern com.sun.management API if available
            if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                try {
                    java.lang.reflect.Method method = com.sun.management.OperatingSystemMXBean.class.getDeclaredMethod("getProcessCpuLoad");
                    method.setAccessible(true);
                    double value = (double) method.invoke(osBean);
                    if (value >= 0.0) {
                        cpuLoad = value;
                    }
                } catch (Exception ex) {
                    logger.debug("Failed to get CPU load using getProcessCpuLoad: {}", ex.getMessage());
                }
            }
            
            // If that didn't work, try other methods
            if (cpuLoad < 0.0) {
                double systemLoadAvg = osBean.getSystemLoadAverage();
                if (systemLoadAvg >= 0) {
                    int processors = osBean.getAvailableProcessors();
                    cpuLoad = systemLoadAvg / processors;
                }
            }
            
            // If still no valid data, try platform-specific solutions
            if (cpuLoad < 0.0) {
                String osName = System.getProperty("os.name").toLowerCase();
                if (osName.contains("linux")) {
                    cpuLoad = getLinuxCpuLoad();
                } else if (osName.contains("win")) {
                    long[] prevCpuTime = new long[1];
                    long[] prevUpTime = new long[1];
                    cpuLoad = getWindowsCpuLoad(prevCpuTime, prevUpTime);
                }
            }
            
            // Convert to percentage and ensure it's between 0-100
            return cpuLoad < 0 ? 15.0 : Math.min(cpuLoad * 100, 100.0);
            
        } catch (Exception e) {
            logger.warn("Failed to get CPU load: {}", e.getMessage());
            return 15.0;
        }
    }
      private double getLinuxCpuLoad() throws Exception {
        try {
            // First try reading from /proc/stat for most accurate CPU usage
            try (BufferedReader reader = new BufferedReader(new FileReader("/proc/stat"))) {
                String line = reader.readLine();
                if (line != null && line.startsWith("cpu ")) {
                    String[] values = line.split("\\s+");
                    if (values.length >= 8) {
                        long user = Long.parseLong(values[1]);
                        long nice = Long.parseLong(values[2]);
                        long system = Long.parseLong(values[3]);
                        long idle = Long.parseLong(values[4]);
                        long iowait = Long.parseLong(values[5]);
                        long irq = Long.parseLong(values[6]);
                        long softirq = Long.parseLong(values[7]);
                        
                        long totalCpu = user + nice + system + idle + iowait + irq + softirq;
                        long totalIdle = idle + iowait;
                        
                        return ((double)(totalCpu - totalIdle) / totalCpu) * 100.0;
                    }
                }
            } catch (Exception e) {
                logger.debug("Could not read /proc/stat: {}", e.getMessage());
            }
            
            // Fallback to top command
            Process p = Runtime.getRuntime().exec("top -bn1");
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("%Cpu(s):")) {
                        String[] parts = line.split(",");
                        for (String part : parts) {
                            if (part.contains("id")) {
                                double idle = Double.parseDouble(part.trim().split("\\s+")[0]);
                                return 100.0 - idle; // Convert idle percentage to usage percentage
                            }
                        }
                    }
                }
            }
            
            // If top fails, try mpstat
            Process mpstat = Runtime.getRuntime().exec("mpstat 1 1");
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(mpstat.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.contains("all")) {
                        String[] parts = line.trim().split("\\s+");
                        if (parts.length > 12) {
                            double idle = Double.parseDouble(parts[12]);
                            return 100.0 - idle;
                        }
                    }
                }
            } catch (Exception e) {
                logger.debug("mpstat not available: {}", e.getMessage());
            }
        } catch (Exception e) {
            logger.warn("Failed to get Linux CPU load: {}", e.getMessage());
        }
        return -1.0;
    }
      private double getWindowsCpuLoad(long[] prevCpuTime, long[] prevUpTime) {
        try {
            // First try using wmic for instantaneous CPU load
            try {
                Process p = Runtime.getRuntime().exec("wmic cpu get loadpercentage");
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                    String line;
                    reader.readLine(); // Skip header
                    if ((line = reader.readLine()) != null) {
                        double load = Double.parseDouble(line.trim());
                        if (load >= 0 && load <= 100) {
                            return load / 100.0;
                        }
                    }
                }
            } catch (Exception e) {
                logger.debug("WMIC method failed: {}", e.getMessage());
            }

            // Fallback to Performance Counter method
            try {
                Process p = Runtime.getRuntime().exec(
                    "powershell \"Get-Counter '\\Processor(_Total)\\% Processor Time' -SampleInterval 1 -MaxSamples 1 | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue\""
                );
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                    String line = reader.readLine();
                    if (line != null) {
                        double load = Double.parseDouble(line.trim());
                        if (load >= 0 && load <= 100) {
                            return load / 100.0;
                        }
                    }
                }
            } catch (Exception e) {
                logger.debug("Performance Counter method failed: {}", e.getMessage());
            }

            // Last resort: use process time deltas
            com.sun.management.OperatingSystemMXBean sunOsBean = 
                (com.sun.management.OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
            long systemTime = sunOsBean.getProcessCpuTime();
            long upTime = ManagementFactory.getRuntimeMXBean().getUptime();
            
            if (prevCpuTime[0] == 0) {
                prevCpuTime[0] = systemTime;
                prevUpTime[0] = upTime;
                return -1.0;
            }

            long timeDiff = systemTime - prevCpuTime[0];
            long upDiff = upTime - prevUpTime[0];
            
            prevCpuTime[0] = systemTime;
            prevUpTime[0] = upTime;            if (upDiff > 0) {
                return ((double) timeDiff / (upDiff * 10000000L));
            }
        } catch (Exception e) {
            logger.warn("Failed to get Windows CPU load: {}", e.getMessage());
        }
        return -1.0;
    }

    private SystemMetrics.DiskSpace getDiskSpaceInfo() {
        SystemMetrics.DiskSpace diskSpace = new SystemMetrics.DiskSpace();
        String osName = System.getProperty("os.name").toLowerCase();
        
        try {
            if (osName.contains("linux")) {
                // On Linux, try df command first for most accurate filesystem info
                try {
                    Process p = Runtime.getRuntime().exec("df -k /");
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                        reader.readLine(); // Skip header
                        String line = reader.readLine();
                        if (line != null) {
                            String[] parts = line.trim().split("\\s+");
                            if (parts.length >= 4) {
                                long total = Long.parseLong(parts[1]); // KB
                                long used = Long.parseLong(parts[2]);  // KB
                                long free = Long.parseLong(parts[3]);  // KB
                                
                                // Convert to MB
                                diskSpace.setTotal(total / 1024);
                                diskSpace.setUsed(used / 1024);
                                diskSpace.setFree(free / 1024);
                                return diskSpace;
                            }
                        }
                    }
                } catch (Exception e) {
                    logger.debug("df command failed: {}", e.getMessage());
                }
            } else if (osName.contains("win")) {
                // On Windows, try using WMI first
                try {
                    Process p = Runtime.getRuntime().exec(
                        "wmic logicaldisk get size,freespace,caption"
                    );
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                        String line;
                        reader.readLine(); // Skip header
                        long total = 0;
                        long free = 0;
                        while ((line = reader.readLine()) != null) {
                            line = line.trim();
                            if (!line.isEmpty()) {
                                String[] parts = line.split("\\s+");
                                if (parts.length >= 3) {
                                    try {
                                        total += Long.parseLong(parts[1]);
                                        free += Long.parseLong(parts[0]);
                                    } catch (NumberFormatException ignored) {}
                                }
                            }
                        }
                        if (total > 0) {
                            diskSpace.setTotal(total / (1024 * 1024));
                            diskSpace.setFree(free / (1024 * 1024));
                            diskSpace.setUsed((total - free) / (1024 * 1024));
                            return diskSpace;
                        }
                    }
                } catch (Exception e) {
                    logger.debug("WMI disk space check failed: {}", e.getMessage());
                }
            }

            // Fallback to Java NIO
            long totalSpace = 0;
            long freeSpace = 0;
            long usableSpace = 0;
            
            for (Path root : FileSystems.getDefault().getRootDirectories()) {
                try {
                    FileStore store = Files.getFileStore(root);
                    if (!store.isReadOnly()) {
                        totalSpace += store.getTotalSpace();
                        freeSpace += store.getUnallocatedSpace();
                        usableSpace += store.getUsableSpace();
                    }
                } catch (Exception e) {
                    logger.debug("Could not get space info for root {}: {}", root, e.getMessage());
                }
            }
            
            if (totalSpace > 0) {
                // Convert to MB
                diskSpace.setTotal(totalSpace / (1024 * 1024));
                diskSpace.setFree(usableSpace / (1024 * 1024));
                diskSpace.setUsed((totalSpace - freeSpace) / (1024 * 1024));
                return diskSpace;
            }

            // Last resort - try legacy File API
            long total = 0;
            long free = 0;
            for (File root : File.listRoots()) {
                total += root.getTotalSpace();
                free += root.getUsableSpace();
            }
            
            if (total > 0) {
                diskSpace.setTotal(total / (1024 * 1024));
                diskSpace.setFree(free / (1024 * 1024));
                diskSpace.setUsed((total - free) / (1024 * 1024));
                return diskSpace;
            }

            logger.warn("All disk space detection methods failed, using defaults");
            diskSpace.setTotal(100000); // 100GB
            diskSpace.setUsed(50000);   // 50GB
            diskSpace.setFree(50000);   // 50GB
            
        } catch (Exception e) {
            logger.error("Error getting disk space info: {}", e.getMessage());
            diskSpace.setTotal(100000);
            diskSpace.setUsed(50000);
            diskSpace.setFree(50000);
        }
        
        return diskSpace;
    }

    private String formatMs(double ms) {
        if (ms < 1000) return String.format("%.0f ms", ms);
        return String.format("%.2f s", ms / 1000);
    }    @Scheduled(fixedRate = 3000000) // Every minute
    public void checkAndCleanupOldData() {
        if (!isMonitoringEnabled()) return;

        // Clean up old data that's beyond our retention window
        // This would be more sophisticated in a production environment
        logger.debug("Running scheduled cleanup of old performance data");
    }
    
    /**
     * Track when a new HTTP connection is made
     */
    public void connectionStarted() {
        activeConnections.incrementAndGet();
        totalConnections.incrementAndGet();
        logger.debug("New connection started. Active connections: {}, Total: {}", 
                    activeConnections.get(), totalConnections.get());
    }
    
    /**
     * Track when an HTTP connection ends
     */
    public void connectionEnded() {
        activeConnections.decrementAndGet();
        logger.debug("Connection ended. Active connections: {}", activeConnections.get());
    }
    
    /**
     * Get the current count of active connections
     */
    public int getActiveConnectionCount() {
        return activeConnections.get();
    }
    
    /**
     * Get the total connections since startup
     */
    public int getTotalConnectionCount() {
        return totalConnections.get();
    }
}
