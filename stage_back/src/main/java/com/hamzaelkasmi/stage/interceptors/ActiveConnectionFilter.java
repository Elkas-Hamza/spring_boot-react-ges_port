package com.hamzaelkasmi.stage.interceptors;

import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Filter to track active HTTP connections
 */
@Component
public class ActiveConnectionFilter implements Filter {
    private static final AtomicInteger activeConnections = new AtomicInteger(0);

    public static int getActiveConnections() {
        return activeConnections.get();
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        activeConnections.incrementAndGet();
        try {
            chain.doFilter(request, response);
        } finally {
            activeConnections.decrementAndGet();
        }
    }
}
