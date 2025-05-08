package com.hamzaelkasmi.stage.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth/debug")
public class AuthDebugController {
    private static final Logger logger = LoggerFactory.getLogger(AuthDebugController.class);
    
    @GetMapping("/info")
    public Map<String, Object> getAuthInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> info = new HashMap<>();
        
        if (auth != null) {
            info.put("principal", auth.getPrincipal().toString());
            info.put("authenticated", auth.isAuthenticated());
            info.put("authorities", auth.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
            info.put("name", auth.getName());
            
            logger.info("Auth info request - User: {}, Authorities: {}", 
                auth.getName(), auth.getAuthorities());
        } else {
            info.put("error", "No authentication information available");
            logger.warn("Auth info request - No authentication information available");
        }
        
        return info;
    }
    
    @GetMapping("/admin-check")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public Map<String, Object> adminCheck() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Admin check request - User: {}, Authorities: {}", 
            auth.getName(), auth.getAuthorities());
            
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "You have ADMIN access!");
        return response;
    }
    
    @GetMapping("/user-check")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public Map<String, Object> userCheck() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("User check request - User: {}, Authorities: {}", 
            auth.getName(), auth.getAuthorities());
            
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "You have USER access!");
        return response;
    }
    
    @GetMapping("/headers")
    public Map<String, String> getRequestHeaders(HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        request.getHeaderNames().asIterator().forEachRemaining(headerName -> 
            headers.put(headerName, request.getHeader(headerName)));
        return headers;
    }
    
    @PostMapping("/test-user-create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public Map<String, Object> testUserCreate() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Test user create request - User: {}, Authorities: {}", 
            auth.getName(), auth.getAuthorities());
            
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "You have permission to create users!");
        return response;
    }
} 