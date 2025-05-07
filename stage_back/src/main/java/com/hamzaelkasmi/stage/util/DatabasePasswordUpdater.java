package com.hamzaelkasmi.stage.util;

import com.hamzaelkasmi.stage.model.User;
import com.hamzaelkasmi.stage.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Optional;

/**
 * Utility class to ensure database passwords are properly encoded.
 * This will run only when the "fixpasswords" profile is active.
 */
@Component
@Profile("fixpasswords")
public class DatabasePasswordUpdater {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    /**
     * Updates the default user passwords to ensure they are properly BCrypt encoded
     */
    @PostConstruct
    @Transactional
    public void updateDefaultPasswords() {
        System.out.println("=======================");
        System.out.println("UPDATING USER PASSWORDS");
        System.out.println("=======================");
        
        // Update admin password
        updateUserPassword("admin@marsamaroc.co.ma", "admin123");
        
        // Update user password
        updateUserPassword("user@marsamaroc.co.ma", "user123");
        
        System.out.println("=======================");
        System.out.println("PASSWORD UPDATE COMPLETE");
        System.out.println("=======================");
    }
    
    private void updateUserPassword(String email, String password) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String newHash = passwordEncoder.encode(password);
                
                System.out.println("Updating password for: " + email);
                System.out.println("Old password hash: " + user.getPassword());
                System.out.println("New password hash: " + newHash);
                
                user.setPassword(newHash);
                userRepository.save(user);
                
                System.out.println("Password updated successfully for: " + email);
            } else {
                System.out.println("User not found: " + email);
            }
        } catch (Exception e) {
            System.err.println("Error updating password for " + email + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
} 