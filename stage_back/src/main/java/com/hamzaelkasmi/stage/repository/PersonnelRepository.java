package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Personnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface PersonnelRepository extends JpaRepository<Personnel, Integer> {
    @Query("SELECT p FROM Personnel p WHERE p.MATRICULE_personnel = :matricule")
    Optional<Personnel> findByMatriculePersonnel(@Param("matricule") String matricule);
}