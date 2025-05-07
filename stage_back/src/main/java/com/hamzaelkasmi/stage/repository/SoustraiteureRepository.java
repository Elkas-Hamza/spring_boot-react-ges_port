package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Soustraiteure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SoustraiteureRepository extends JpaRepository<Soustraiteure, String> {
    // No need for custom queries as MATRICULE_soustraiteure is now the ID

    // Find soustraiteurs by equipe ID using a query
    @Query(value = "SELECT s.* FROM soustraiteure s " +
                   "JOIN equipe_has_soustraiteure es ON s.MATRICULE_soustraiteure = es.soustraiteure_MATRICULE_soustraiteure " +
                   "WHERE es.equipe_ID_equipe = ?1", nativeQuery = true)
    List<Soustraiteure> findByEquipeId(String equipeId);
}