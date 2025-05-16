package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.User;
import com.hamzaelkasmi.stage.service.AuthService;
import com.hamzaelkasmi.stage.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        if (loginRequest.get("email") == null || loginRequest.get("password") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
          try {            String token = authService.authenticate(email, password);
            User user = userService.getUserByEmail(email);
            return ResponseEntity.ok().body(Map.of(
                "token", token,
                "user", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "role", user.getRole(),
                    "nom", user.getNom(),
                    "prenom", user.getPrenom()
                )
            ));
        } catch (RuntimeException e) {
            userService.recordFailedLoginAttempt(email);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User registeredUser = userService.createUser(user);
            return ResponseEntity.ok().body(Map.of(
                "message", "User registered successfully",
                "user", Map.of(
                    "id", registeredUser.getId(),
                    "email", registeredUser.getEmail(),
                    "role", registeredUser.getRole()
                )
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }    @PostMapping("/reset-password-request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        try {
            // Log the request
            System.out.println("Password reset requested for email: " + email);
            
            // Call service method
            userService.requestPasswordReset(email);
            
            // For security reasons, always return success even if email doesn't exist
            return ResponseEntity.ok().body(Map.of(
                "message", "If your email is registered, you will receive password reset instructions shortly"
            ));
        } catch (RuntimeException e) {
            // Log the error
            System.err.println("Error in password reset request: " + e.getMessage());
            
            // For security reasons, don't expose specific errors
            return ResponseEntity.ok().body(Map.of(
                "message", "If your email is registered, you will receive password reset instructions shortly"
            ));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token and new password are required"));
        }

        try {
            userService.resetPassword(token, newPassword);
            return ResponseEntity.ok().body(Map.of("message", "Password has been reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        return ResponseEntity.ok().body(Map.of("valid", true));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        String userId = request.get("userId");

        if (currentPassword == null || newPassword == null || userId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password, new password, and user ID are required"));
        }

        try {
            userService.changePassword(userId, currentPassword, newPassword);
            return ResponseEntity.ok().body(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
} 