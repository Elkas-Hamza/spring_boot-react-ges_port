package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Soustraiteure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface SoustraiteureRepository extends JpaRepository<Soustraiteure, Integer> {
    @Query("SELECT s FROM Soustraiteure s WHERE s.MATRICULE_soustraiteure = :matricule")
    Optional<Soustraiteure> findByMatriculeSoustraiteure(@Param("matricule") String matricule);
}