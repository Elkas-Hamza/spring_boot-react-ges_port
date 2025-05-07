package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.util.BCryptTestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    private BCryptTestUtil bcryptTestUtil;

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "API is running");
        response.put("time", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/check-password")
    public ResponseEntity<?> checkPassword(@RequestBody Map<String, String> request) {
        String rawPassword = request.get("password");
        String hash = request.get("hash");
        
        if (rawPassword == null || hash == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password and hash are required"));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("isValidFormat", bcryptTestUtil.isValidBCryptHash(hash));
        response.put("matches", passwordEncoder.matches(rawPassword, hash));
        response.put("newEncodedPassword", passwordEncoder.encode(rawPassword));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/verify-db-passwords")
    public ResponseEntity<?> verifyDbPasswords() {
        Map<String, Object> response = new HashMap<>();
        
        // Default passwords from schema.sql
        String adminHash = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi";
        String userHash = "$2a$10$8K1p/a0dR1LXMIgoEDFrwOfgqw7BxPcR6HtK9JxJxJxJxJxJxJxJx";
        
        response.put("adminCredentials", Map.of(
            "email", "admin@marsamaroc.co.ma",
            "expectedPassword", "admin123",
            "hashValid", bcryptTestUtil.isValidBCryptHash(adminHash),
            "passwordMatches", passwordEncoder.matches("admin123", adminHash)
        ));
        
        response.put("userCredentials", Map.of(
            "email", "user@marsamaroc.co.ma",
            "expectedPassword", "user123",
            "hashValid", bcryptTestUtil.isValidBCryptHash(userHash),
            "passwordMatches", passwordEncoder.matches("user123", userHash)
        ));
        
        // Generate fresh hashes for comparison
        response.put("freshHashes", Map.of(
            "admin123", passwordEncoder.encode("admin123"),
            "user123", passwordEncoder.encode("user123")
        ));
        
        return ResponseEntity.ok(response);
    }
} 