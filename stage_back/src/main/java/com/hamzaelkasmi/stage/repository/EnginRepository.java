package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Engin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnginRepository extends JpaRepository<Engin, String> {
    // Custom queries can be added here if needed
} 