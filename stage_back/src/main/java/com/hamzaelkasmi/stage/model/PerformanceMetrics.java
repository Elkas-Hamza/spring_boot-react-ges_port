package com.hamzaelkasmi.stage.model;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Aggregated performance metrics for the system
 */
public class PerformanceMetrics implements Serializable {
    private List<ApiCallMetric> apiCalls;
    private double responseTimeAverage;
    private ApiCallMetric slowestEndpoint;
    private ApiCallMetric fastestEndpoint;
    private Map<String, Double> errorRates;
    private List<Double> systemLoad;

    public PerformanceMetrics() {
    }

    public List<ApiCallMetric> getApiCalls() {
        return apiCalls;
    }

    public void setApiCalls(List<ApiCallMetric> apiCalls) {
        this.apiCalls = apiCalls;
    }

    public double getResponseTimeAverage() {
        return responseTimeAverage;
    }

    public void setResponseTimeAverage(double responseTimeAverage) {
        this.responseTimeAverage = responseTimeAverage;
    }

    public ApiCallMetric getSlowestEndpoint() {
        return slowestEndpoint;
    }

    public void setSlowestEndpoint(ApiCallMetric slowestEndpoint) {
        this.slowestEndpoint = slowestEndpoint;
    }

    public ApiCallMetric getFastestEndpoint() {
        return fastestEndpoint;
    }

    public void setFastestEndpoint(ApiCallMetric fastestEndpoint) {
        this.fastestEndpoint = fastestEndpoint;
    }

    public Map<String, Double> getErrorRates() {
        return errorRates;
    }

    public void setErrorRates(Map<String, Double> errorRates) {
        this.errorRates = errorRates;
    }

    public List<Double> getSystemLoad() {
        return systemLoad;
    }

    public void setSystemLoad(List<Double> systemLoad) {
        this.systemLoad = systemLoad;
    }
}
