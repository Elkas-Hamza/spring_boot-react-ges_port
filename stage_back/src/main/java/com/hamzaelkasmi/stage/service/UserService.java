package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.User;
import com.hamzaelkasmi.stage.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User createUser(@Valid User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // user.setNom(user.getNom()); // Already set by @RequestBody mapping
        // user.setPrenom(user.getPrenom()); // Already set by @RequestBody mapping
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        user.setAccountLocked(false);
        
        return userRepository.save(user);
    }

    public User updateUser(String id, @Valid User userDetails) {
        User user = getUserById(id);
        
        // Check if new email is taken by another user
        if (!user.getEmail().equals(userDetails.getEmail()) && 
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        user.setEmail(userDetails.getEmail());
        user.setNom(userDetails.getNom()); // Ensure nom is updated
        user.setPrenom(userDetails.getPrenom()); // Ensure prenom is updated
        
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        user.setRole(userDetails.getRole());
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public void changePassword(String id, String currentPassword, String newPassword) {
        User user = getUserById(id);
        
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        if (currentPassword.equals(newPassword)) {
            throw new RuntimeException("New password must be different from current password");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }    public void requestPasswordReset(String email) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (!userOptional.isPresent()) {
                // For security reasons, don't reveal whether email exists or not
                // but log the error for debugging
                System.out.println("Password reset requested for non-existent email: " + email);
                return; // Return silently without throwing exception
            }
            
            User user = userOptional.get();
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
            userRepository.save(user);

            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setFrom("marsamaroc.system@gmail.com");
                message.setSubject("Password Reset Request - Système de Management des Ports");
                message.setText("Dear User,\n\n"
                        + "You have requested to reset your password. Please click on the link below to reset your password:\n\n"
                        + "http://localhost:3000/reset-password?token=" + token + "\n\n"
                        + "This link will expire in 24 hours. If you did not request a password reset, please ignore this email.\n\n"
                        + "Thank you,\nThe Management");
                
                System.out.println("Attempting to send email to " + email + " with token: " + token);
                mailSender.send(message);
                System.out.println("Email sent successfully");
            } catch (Exception e) {
                // Log the email sending failure but don't throw error to the client
                System.err.println("Failed to send password reset email: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to send password reset email. Please contact support.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error processing password reset request: " + e.getMessage());
        }
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public void recordFailedLoginAttempt(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            
            if (user.getFailedLoginAttempts() >= 5) {
                user.setAccountLocked(true);
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(30));
            }
            
            userRepository.save(user);
        }
    }

    public void resetFailedLoginAttempts(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFailedLoginAttempts(0);
            user.setAccountLocked(false);
            user.setAccountLockedUntil(null);
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    public void unlockExpiredAccounts() {
        List<User> lockedAccounts = userRepository.findLockedAccountsToUnlock();
        for (User user : lockedAccounts) {
            user.setAccountLocked(false);
            user.setAccountLockedUntil(null);
            user.setFailedLoginAttempts(0);
            userRepository.save(user);
        }
    }

    public List<User> getAllAdmins() {
        return userRepository.findAllAdmins();
    }
}