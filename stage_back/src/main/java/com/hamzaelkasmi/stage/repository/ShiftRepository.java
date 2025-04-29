package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, String> {
    // Custom queries can be added here if needed
} 