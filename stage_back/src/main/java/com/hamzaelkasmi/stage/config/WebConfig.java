package com.hamzaelkasmi.stage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * This class configures Cross-Origin Resource Sharing (CORS)
 * for the application. This is kept in sync with the CORS
 * configuration in SecurityConfig.
 */
@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {            @Override            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("Authorization", "Content-Type", "X-Retry-Count", "x-retry-count", "cache-control", "pragma")
                    .exposedHeaders("X-Retry-Count", "x-retry-count")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
