package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.User;
import com.hamzaelkasmi.stage.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<User> getAllUsers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("GET /api/users - User: {}, Authorities: {}", 
                auth.getName(), 
                auth.getAuthorities());
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @userService.getUserById(#id).email == authentication.principal")
    public User getUserById(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("GET /api/users/{} - User: {}, Authorities: {}", 
                id, auth.getName(), auth.getAuthorities());
        return userService.getUserById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public User createUser(@RequestBody User user) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("POST /api/users - User: {}, Authorities: {}", 
                auth.getName(), 
                auth.getAuthorities());
        
        // Add more verbose logging to diagnose the authorization issue
        logger.info("Authentication Principal: {}", auth.getPrincipal());
        logger.info("Authentication Credentials: {}", auth.getCredentials());
        logger.info("Is Authenticated: {}", auth.isAuthenticated());
        logger.info("Has ADMIN role (direct check): {}", auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        
        logger.info("Creating user: {}", user);
        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @userService.getUserById(#id).email == authentication.principal")
    public User updateUser(@PathVariable String id, @RequestBody User userDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User targetUser = userService.getUserById(id);
        
        // If an admin is trying to update another admin (who is not themselves)
        if (targetUser.getRole().name().equals("ADMIN") && 
            !targetUser.getEmail().equals(auth.getName()) && 
            auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            
            // Only allow updates to non-sensitive fields
            // Preserve the original role and other sensitive data
            userDetails.setRole(targetUser.getRole());
            logger.info("Admin {} is updating another admin {}. Preserving role and sensitive data.", 
                auth.getName(), targetUser.getEmail());
        }
        
        return userService.updateUser(id, userDetails);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User targetUser = userService.getUserById(id);
        
        // Prevent admins from deleting other admins
        if (targetUser.getRole().name().equals("ADMIN") && 
            !targetUser.getEmail().equals(auth.getName())) {
            
            logger.warn("Admin {} attempted to delete another admin {}, but this is not allowed.", 
                auth.getName(), targetUser.getEmail());
                
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Administrators cannot delete other administrators");
        }
        
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/change-password")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or @userService.getUserById(#id).email == authentication.principal")
    public ResponseEntity<?> changePassword(
            @PathVariable String id,
            @RequestBody Map<String, String> passwords) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User targetUser = userService.getUserById(id);
        
        // Prevent admins from changing other admins' passwords
        if (targetUser.getRole().name().equals("ADMIN") && 
            !targetUser.getEmail().equals(auth.getName())) {
            
            logger.warn("Admin {} attempted to change password for another admin {}, but this is not allowed.", 
                auth.getName(), targetUser.getEmail());
                
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Administrators cannot change the password of other administrators");
        }
        
        userService.changePassword(
            id,
            passwords.get("currentPassword"),
            passwords.get("newPassword")
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/request-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        userService.requestPasswordReset(request.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        userService.resetPassword(
            request.get("token"),
            request.get("newPassword")
        );
        return ResponseEntity.ok().build();
    }
} 