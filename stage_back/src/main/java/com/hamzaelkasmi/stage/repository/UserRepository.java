package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    Optional<User> findByEmailAndAccountLockedFalse(String email);
    
    @Query("SELECT u FROM User u WHERE u.accountLocked = true AND u.accountLockedUntil < CURRENT_TIMESTAMP")
    List<User> findLockedAccountsToUnlock();
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.role = 'ADMIN'")
    List<User> findAllAdmins();
} 