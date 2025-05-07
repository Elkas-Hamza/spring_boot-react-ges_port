package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipeRepository extends JpaRepository<Equipe, String>, CustomEquipeRepository {

    @Query("SELECT e FROM Equipe e WHERE e.id_equipe = :id")
    Optional<Equipe> findByEquipeId(@Param("id") String id);

    @Query("SELECT e FROM Equipe e WHERE e.nom_equipe LIKE %:name%")
    List<Equipe> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT e FROM Equipe e JOIN e.personnel p WHERE p.MATRICULE_personnel = :personnelId")
    List<Equipe> findByPersonnelId(@Param("personnelId") String personnelId);
    
    @Query("SELECT e FROM Equipe e JOIN e.soustraiteurs s WHERE s.MATRICULE_soustraiteure = :soustraiteurId")
    List<Equipe> findBySoustraiteurId(@Param("soustraiteurId") String soustraiteurId);

}
