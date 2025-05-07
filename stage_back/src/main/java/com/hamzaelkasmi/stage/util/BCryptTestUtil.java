package com.hamzaelkasmi.stage.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Utility class to test BCrypt password compatibility
 */
@Component
public class BCryptTestUtil {

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    /**
     * Checks if a raw password matches a hashed password
     * 
     * @param rawPassword The plain text password
     * @param hashedPassword The hashed password to compare against
     * @return true if the passwords match
     */
    public boolean matches(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
    
    /**
     * Generates a new BCrypt hash for a raw password
     * 
     * @param rawPassword The plain text password to hash
     * @return The BCrypt hashed password
     */
    public String encode(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
    
    /**
     * Checks if the provided hash is in valid BCrypt format
     * 
     * @param hash The hash to validate
     * @return true if the hash appears to be in BCrypt format
     */
    public boolean isValidBCryptHash(String hash) {
        // BCrypt hashes start with "$2a$", "$2b$", or "$2y$" and are 60 characters long
        return hash != null && 
               hash.length() == 60 && 
               (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));
    }
    
    /**
     * Test method for pre-existing hashed passwords
     */
    public void testPredefinedPasswords() {
        String adminHashFromDb = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi";
        String userHashFromDb = "$2a$10$8K1p/a0dR1LXMIgoEDFrwOfgqw7BxPcR6HtK9JxJxJxJxJxJxJxJx";
        
        // Check format validity
        System.out.println("Admin hash valid format: " + isValidBCryptHash(adminHashFromDb));
        System.out.println("User hash valid format: " + isValidBCryptHash(userHashFromDb));
        
        // Check password matches
        System.out.println("admin123 matches admin hash: " + matches("admin123", adminHashFromDb));
        System.out.println("user123 matches user hash: " + matches("user123", userHashFromDb));
        
        // Generate new hashes for comparison
        System.out.println("New hash for admin123: " + encode("admin123"));
        System.out.println("New hash for user123: " + encode("user123"));
    }
} 