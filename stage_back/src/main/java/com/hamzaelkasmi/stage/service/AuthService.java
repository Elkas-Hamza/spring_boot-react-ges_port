package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.User;
import com.hamzaelkasmi.stage.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmailAndAccountLockedFalse(email);
        
        if (userOpt.isEmpty()) {
            // Check if account is locked
            Optional<User> lockedUser = userRepository.findByEmail(email);
            if (lockedUser.isPresent() && lockedUser.get().getAccountLocked()) {
                LocalDateTime lockUntil = lockedUser.get().getAccountLockedUntil();
                if (lockUntil != null && lockUntil.isAfter(LocalDateTime.now())) {
                    throw new RuntimeException("Account is locked. Try again later.");
                } else {
                    // Unlock account if lock period has expired
                    User user = lockedUser.get();
                    user.setAccountLocked(false);
                    user.setFailedLoginAttempts(0);
                    userRepository.save(user);
                    // Continue with authentication
                } 
            } else {
                throw new RuntimeException("Invalid email or password");
            }
        }
        
        User user = userOpt.orElseGet(() -> userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password")));
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        return generateToken(user);
    }
    
    private String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        
        return Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("roles", List.of("ROLE_" + user.getRole().name()))
                .signWith(key)
                .compact();
    }
} 