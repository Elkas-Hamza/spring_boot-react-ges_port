package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Personnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PersonnelRepository extends JpaRepository<Personnel, String> {
    // No need for custom queries as MATRICULE_personnel is now the ID

    // Find personnel by equipe ID using a query
    @Query(value = "SELECT p.* FROM personnel p " +
                   "JOIN equipe_has_personnel ep ON p.MATRICULE_personnel = ep.personnel_MATRICULE_personnel " +
                   "WHERE ep.equipe_ID_equipe = ?1", nativeQuery = true)
    List<Personnel> findByEquipeId(String equipeId);
}