package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.User;
import com.hamzaelkasmi.stage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for maintenance operations
 */
@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:3000")
public class MaintenanceController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    /**
     * Fixes the default user passwords in the database
     */
    @PostMapping("/fix-passwords")
    public ResponseEntity<?> fixPasswords() {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> updates = new HashMap<>();
        
        // Fix admin password
        boolean adminFixed = updateUserPassword("admin@marsamaroc.co.ma", "admin123");
        updates.put("admin", adminFixed ? "updated" : "failed");
        
        // Fix user password
        boolean userFixed = updateUserPassword("user@marsamaroc.co.ma", "user123");
        updates.put("user", userFixed ? "updated" : "failed");
        
        result.put("passwordUpdates", updates);
        
        return ResponseEntity.ok(result);
    }
    
    private boolean updateUserPassword(String email, String password) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String newHash = passwordEncoder.encode(password);
                
                user.setPassword(newHash);
                userRepository.save(user);
                
                return true;
            }
        } catch (Exception e) {
            // Log exception
            System.err.println("Error updating password for " + email + ": " + e.getMessage());
        }
        
        return false;
    }
} 