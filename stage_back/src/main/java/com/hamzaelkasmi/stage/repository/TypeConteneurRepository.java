package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.TypeConteneur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeConteneurRepository extends JpaRepository<TypeConteneur, Integer> {
    
    Optional<TypeConteneur> findByNomType(String nomType);
    
    boolean existsByNomType(String nomType);
} 