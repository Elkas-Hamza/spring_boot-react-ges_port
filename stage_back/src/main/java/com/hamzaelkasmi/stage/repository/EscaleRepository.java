package com.hamzaelkasmi.stage.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.hamzaelkasmi.stage.model.Escale;
import java.util.List;

@Repository
public interface EscaleRepository extends JpaRepository<Escale, String> {
    // Analytics methods
    @Query("SELECT COUNT(e) FROM Escale e WHERE " +
            "(:status = 'EN_COURS' AND e.DATE_sortie > CURRENT_TIMESTAMP) OR " +
            "(:status = 'TERMINEE' AND e.DATE_sortie <= CURRENT_TIMESTAMP)")
    long countByStatus(@Param("status") String status);

    @Query("SELECT e FROM Escale e ORDER BY e.DATE_accostage DESC")
    List<Escale> findRecentEscales(Pageable pageable);

    // Find escales where departure date has passed (ships should be deleted)
    @Query("SELECT e FROM Escale e WHERE e.DATE_sortie <= CURRENT_TIMESTAMP")
    List<Escale> findExpiredEscales();

    // Find escales by ship matricule
    @Query("SELECT e FROM Escale e WHERE e.MATRICULE_navire = :matricule")
    List<Escale> findByMatriculeNavire(@Param("matricule") String matricule);
}