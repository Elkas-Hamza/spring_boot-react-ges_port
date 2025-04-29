package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Personnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PersonnelRepository extends JpaRepository<Personnel, String> {
    // No need for custom queries as MATRICULE_personnel is now the ID
}