package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Conteneure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ConteneureRepository extends JpaRepository<Conteneure, String> {
    // Custom queries can be added here if needed
    
    // Count containers with TYPE_conteneure = 'TERRE' (for port utilization)
    @Query(value = "SELECT COUNT(c.ID_conteneure) FROM conteneure c WHERE c.TYPE_conteneure = 'TERRE'", nativeQuery = true)
    int countByEmplacement();
} 