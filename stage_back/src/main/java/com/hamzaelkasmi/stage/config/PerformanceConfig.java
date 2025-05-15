package com.hamzaelkasmi.stage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

/**
 * Configuration for loading performance monitoring properties
 */
@Configuration
@PropertySource("classpath:performance.properties")
public class PerformanceConfig {
    // This class exists to load the performance.properties file
    // No additional configuration is needed here as the properties
    // will be automatically loaded and available via @Value in other classes
}