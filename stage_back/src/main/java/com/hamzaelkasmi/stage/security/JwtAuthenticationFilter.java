package com.hamzaelkasmi.stage.security;

import com.hamzaelkasmi.stage.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String requestMethod = request.getMethod();
        logger.info("Processing request: {} {} to {}", requestMethod, requestURI, request.getRemoteAddr());
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            logger.info("JWT token present: {}", token.substring(0, Math.min(10, token.length())) + "...");
            
            try {
                // Log important details about the request
                logger.info("Request details - URI: {}, Method: {}, Remote IP: {}", 
                    requestURI, requestMethod, request.getRemoteAddr());
                
                SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                
                Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
                
                // Log the entire claims for debugging
                logger.info("JWT claims: {}", claims);
                
                String email = claims.getSubject();
                logger.info("JWT token validated for user: {}", email);
                
                if (email != null) {
                    @SuppressWarnings("unchecked")
                    List<String> roles = (List<String>) claims.get("roles");
                    
                    // Debug log roles
                    logger.info("JWT Auth - Email: {}, Roles from token: {}", email, roles);
                    
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    
                    // Add roles with ROLE_ prefix for Spring Security
                    if (roles != null) {
                        logger.info("Raw roles from JWT: {}", roles);
                        for (String role : roles) {
                            // If the role doesn't already have ROLE_ prefix, add it
                            if (!role.startsWith("ROLE_")) {
                                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                                logger.info("Adding authority with prefix: ROLE_{}", role);
                            } else {
                                authorities.add(new SimpleGrantedAuthority(role));
                                logger.info("Adding authority as is: {}", role);
                            }
                        }
                    }
                    
                    logger.info("Final granted authorities: {}", authorities);
                    
                    // Test if these authorities would grant access to the current endpoint
                    boolean hasAdminRole = authorities.stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean hasUserRole = authorities.stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));
                    
                    logger.info("Authority check - Has ROLE_ADMIN: {}, Has ROLE_USER: {}", 
                        hasAdminRole, hasUserRole);
                    
                    // Debug specific endpoints
                    if (requestURI.contains("/api/conteneurs")) {
                        logger.info("Container endpoint access - Has admin role: {}", hasAdminRole);
                    }
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, 
                        null, 
                        authorities
                    );
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.info("Authentication set in SecurityContext: {}", authentication);
                    
                    // Reset failed login attempts upon successful authentication
                    userService.resetFailedLoginAttempts(email);
                }
            } catch (Exception e) {
                logger.error("JWT Authentication error: ", e);
                SecurityContextHolder.clearContext();
            }
        } else {
            logger.info("No JWT token found in request");
        }
        
        filterChain.doFilter(request, response);
    }
} 