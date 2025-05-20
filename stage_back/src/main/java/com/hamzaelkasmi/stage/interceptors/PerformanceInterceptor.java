package com.hamzaelkasmi.stage.interceptors;

import com.hamzaelkasmi.stage.model.ApiCallMetric;
import com.hamzaelkasmi.stage.service.PerformanceMonitoringService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Interceptor that tracks API call performance
 */
@Component
public class PerformanceInterceptor implements HandlerInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(PerformanceInterceptor.class);
    
    private final PerformanceMonitoringService performanceService;
    
    // Thread-local variables to store request-specific timing data
    private final ThreadLocal<Long> startTimeHolder = new ThreadLocal<>();
    
    public PerformanceInterceptor(PerformanceMonitoringService performanceService) {
        this.performanceService = performanceService;
    }
      @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Track connection start regardless of monitoring status
        performanceService.connectionStarted();
        
        if (!performanceService.isMonitoringEnabled()) {
            return true;
        }
        
        startTimeHolder.set(System.currentTimeMillis());
        return true;
    }
    
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
        // No action needed here
    }
      @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // Always track connection end regardless of monitoring status
        performanceService.connectionEnded();
        
        if (!performanceService.isMonitoringEnabled()) {
            return;
        }
        
        Long startTime = startTimeHolder.get();
        if (startTime == null) {
            return;
        }
        
        try {
            long endTime = System.currentTimeMillis();
            double responseTime = endTime - startTime;
            
            String endpoint = getEndpointFromRequest(request);
            boolean successful = isSuccessful(response.getStatus());
            String method = request.getMethod();
            
            ApiCallMetric metric = new ApiCallMetric(
                    endpoint,
                    responseTime,
                    successful,
                    method,
                    response.getStatus()
            );
            
            performanceService.recordApiCall(metric);
            
        } catch (Exception e) {
            logger.error("Error in performance interceptor", e);
        } finally {
            // Clean up thread local
            startTimeHolder.remove();
        }
    }
    
    private String getEndpointFromRequest(HttpServletRequest request) {
        String uri = request.getRequestURI();
        // Remove context path if present
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }
        return uri;
    }
    
    private boolean isSuccessful(int statusCode) {
        return statusCode >= 200 && statusCode < 400;
    }
}
