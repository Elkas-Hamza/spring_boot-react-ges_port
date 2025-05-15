package com.hamzaelkasmi.stage.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * Represents metrics for an API call
 */
@Entity
@Table(name = "api_call_metrics")
public class ApiCallMetric implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "endpoint")
    private String endpoint;
    
    @Column(name = "response_time")
    private double responseTime;
    
    @Column(name = "successful")
    private boolean successful;
    
    @Column(name = "method")
    private String method;
    
    @Column(name = "status_code")
    private int statusCode;
    
    @Column(name = "timestamp")
    private Instant timestamp;

    public ApiCallMetric() {
        this.timestamp = Instant.now();
    }
    
    public ApiCallMetric(String endpoint, double responseTime, boolean successful, String method, int statusCode) {
        this.endpoint = endpoint;
        this.responseTime = responseTime;
        this.successful = successful;
        this.method = method;
        this.statusCode = statusCode;
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

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public Instant getTimestamp() {
        return timestamp;
    }    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
}
