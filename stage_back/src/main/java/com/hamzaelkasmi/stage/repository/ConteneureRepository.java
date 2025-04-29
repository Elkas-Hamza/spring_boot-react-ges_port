package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Conteneure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConteneureRepository extends JpaRepository<Conteneure, String> {
    // Custom queries can be added here if needed
} 