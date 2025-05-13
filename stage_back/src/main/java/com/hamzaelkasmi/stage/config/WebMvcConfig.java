package com.hamzaelkasmi.stage.config;

import com.hamzaelkasmi.stage.interceptors.PerformanceInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration for registering interceptors for 'com.stage' package
 * This class is renamed to avoid conflicts with the WebMvcConfig in com.hamzaelkasmi.stage
 */
@Configuration
@Order(2) // Lower priority than the main config
public class WebMvcConfig implements WebMvcConfigurer {

    private final PerformanceInterceptor performanceInterceptor;

    public WebMvcConfig(PerformanceInterceptor performanceInterceptor) {
        this.performanceInterceptor = performanceInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Add performance monitoring interceptor
        registry.addInterceptor(performanceInterceptor)
                .addPathPatterns("/api/**") // Apply to API endpoints
                .excludePathPatterns("/api/monitoring/**"); // Don't monitor the monitoring endpoints themselves
    }
}
