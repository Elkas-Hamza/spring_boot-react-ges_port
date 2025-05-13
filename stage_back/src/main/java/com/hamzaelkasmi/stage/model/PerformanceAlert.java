package com.hamzaelkasmi.stage.model;

import java.io.Serializable;
import java.time.Instant;

/**
 * Represents a performance alert in the system
 */
public class PerformanceAlert implements Serializable {
    private String endpoint;
    private double responseTime;
    private String message;
    private AlertLevel level;
    private Instant timestamp;
    
    public enum AlertLevel {
        INFO, WARNING, ERROR, CRITICAL
    }
    
    public PerformanceAlert() {
        this.timestamp = Instant.now();
    }
    
    public PerformanceAlert(String endpoint, double responseTime, String message, AlertLevel level) {
        this.endpoint = endpoint;
        this.responseTime = responseTime;
        this.message = message;
        this.level = level;
        this.timestamp = Instant.now();
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public double getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(double responseTime) {
        this.responseTime = responseTime;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public AlertLevel getLevel() {
        return level;
    }

    public void setLevel(AlertLevel level) {
        this.level = level;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
