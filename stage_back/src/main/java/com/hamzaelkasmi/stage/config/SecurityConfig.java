package com.hamzaelkasmi.stage.config;

import com.hamzaelkasmi.stage.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.access.expression.DenyAllPermissionEvaluator;
import org.springframework.http.HttpMethod;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthFilter) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/test/**").permitAll()
                .requestMatchers("/api/maintenance/**").permitAll()
                .requestMatchers("/api/analytics/test").permitAll()
                .requestMatchers("/api/settings/**").permitAll()
                
                // Explicitly allow all container operations for ADMIN role
                .requestMatchers(HttpMethod.GET, "/api/conteneurs/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/conteneurs/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/conteneurs/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/conteneurs/**").hasAuthority("ROLE_ADMIN")
                
                // Secured admin-only endpoints - use hasAuthority with ROLE_ prefix
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                
                // User endpoints - do not restrict here, let method-level security handle it
                .requestMatchers("/api/users/**").authenticated()
                  // Endpoints accessible to both ADMIN and USER roles                .requestMatchers("/api/operations/**").authenticated()
                .requestMatchers("/api/escales/**").authenticated()
                .requestMatchers("/api/equipes/**").authenticated()
                .requestMatchers("/api/shifts/**").authenticated()
                .requestMatchers("/api/engins/**").authenticated()
                .requestMatchers("/api/soustraitants/**").authenticated()
                .requestMatchers("/api/soustraiteurs/**").authenticated() // Added correct endpoint with 'e'
                .requestMatchers("/api/personnel/**").authenticated()
                .requestMatchers("/api/analytics/**").authenticated()
                .requestMatchers("/api/navires/**").authenticated()
                .requestMatchers("/api/monitoring/**").authenticated() // Allow all authenticated users to access monitoring endpoints
                
                // Admin bypass - give admins access to all remaining endpoints
                // This must be after the specific rules
                .requestMatchers("/**").hasAuthority("ROLE_ADMIN")
                
                // Any other endpoint requires authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
    @Bean
    public RoleHierarchy roleHierarchy() {
        RoleHierarchyImpl roleHierarchy = new RoleHierarchyImpl();
        // This means ROLE_ADMIN inherits all privileges from ROLE_USER
        roleHierarchy.setHierarchy("ROLE_ADMIN > ROLE_USER");
        return roleHierarchy;
    }
    
    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler(RoleHierarchy roleHierarchy) {
        DefaultMethodSecurityExpressionHandler expressionHandler = new DefaultMethodSecurityExpressionHandler();
        expressionHandler.setRoleHierarchy(roleHierarchy);
        expressionHandler.setPermissionEvaluator(new DenyAllPermissionEvaluator());
        return expressionHandler;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}