package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Soustraiteure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SoustraiteureRepository extends JpaRepository<Soustraiteure, String> {
    // No need for custom queries as MATRICULE_soustraiteure is now the ID
}