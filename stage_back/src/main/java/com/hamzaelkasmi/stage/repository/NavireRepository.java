package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Navire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NavireRepository extends JpaRepository<Navire, String> {
    
    Optional<Navire> findByIdNavire(String idNavire);
    
    Optional<Navire> findByMatriculeNavire(String matriculeNavire);
    
    Optional<Navire> findByNomNavire(String nomNavire);
    
    boolean existsByNomNavire(String nomNavire);
    
    boolean existsByMatriculeNavire(String matriculeNavire);
} 