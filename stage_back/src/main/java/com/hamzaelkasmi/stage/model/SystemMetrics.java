package com.hamzaelkasmi.stage.model;

import java.io.Serializable;
import java.time.Instant;

/**
 * System metrics model that represents current system performance data
 */
public class SystemMetrics implements Serializable {
    private double cpu;
    private double memory;
    private DiskSpace diskSpace;
    private int activeConnections;
    private long uptime;
    private Instant timestamp;

    public SystemMetrics() {
        this.timestamp = Instant.now();
    }

    // Disk space inner class
    public static class DiskSpace implements Serializable {
        private long total;  // MB
        private long used;   // MB
        private long free;   // MB

        public DiskSpace() {
        }

        public DiskSpace(long total, long used, long free) {
            this.total = total;
            this.used = used;
            this.free = free;
        }

        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }

        public long getUsed() {
            return used;
        }

        public void setUsed(long used) {
            this.used = used;
        }

        public long getFree() {
            return free;
        }

        public void setFree(long free) {
            this.free = free;
        }
    }

    public double getCpu() {
        return cpu;
    }

    public void setCpu(double cpu) {
        this.cpu = cpu;
    }

    public double getMemory() {
        return memory;
    }

    public void setMemory(double memory) {
        this.memory = memory;
    }

    public DiskSpace getDiskSpace() {
        return diskSpace;
    }

    public void setDiskSpace(DiskSpace diskSpace) {
        this.diskSpace = diskSpace;
    }

    public int getActiveConnections() {
        return activeConnections;
    }

    public void setActiveConnections(int activeConnections) {
        this.activeConnections = activeConnections;
    }

    public long getUptime() {
        return uptime;
    }

    public void setUptime(long uptime) {
        this.uptime = uptime;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
