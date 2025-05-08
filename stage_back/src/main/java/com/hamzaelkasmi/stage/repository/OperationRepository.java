package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface OperationRepository extends JpaRepository<Operation, String> {
    @Query("SELECT o FROM Operation o WHERE o.id_operation = :id")
    Optional<Operation> findByOperationId(@Param("id") String id);
    
    @Query("SELECT o FROM Operation o WHERE o.id_escale = :escaleId")
    List<Operation> findByEscaleId(@Param("escaleId") String escaleId);
    
    @Query("SELECT o FROM Operation o WHERE o.id_shift = :shiftId")
    List<Operation> findByShiftId(@Param("shiftId") String shiftId);
    
    @Query("SELECT o FROM Operation o WHERE o.id_equipe = :equipeId")
    List<Operation> findByEquipeId(@Param("equipeId") String equipeId);
    
    @Query(value = "SELECT o.ID_operation, o.TYPE_operation, o.ID_shift, o.ID_escale, " +
                   "o.ID_conteneure, o.ID_engin, o.ID_equipe, o.DATE_debut, o.DATE_fin, " +
                   "s.NOM_shift as nom_shift " +
                   "FROM operation o " +
                   "LEFT JOIN shift s ON o.ID_shift = s.ID_shift", 
           nativeQuery = true)
    List<Object[]> findAllWithShiftDetails();
    
    @Query(value = "SELECT o.ID_operation, o.TYPE_operation, o.ID_shift, o.ID_escale, " +
                   "o.ID_conteneure, o.ID_engin, o.ID_equipe, o.DATE_debut, o.DATE_fin, " +
                   "s.NOM_shift as nom_shift " +
                   "FROM operation o " +
                   "LEFT JOIN shift s ON o.ID_shift = s.ID_shift " +
                   "WHERE o.ID_operation = :operationId", 
           nativeQuery = true)
    Optional<Object[]> findByIdWithShiftDetails(@Param("operationId") String operationId);
    
    // Analytics methods
    List<Operation> findByStatus(String status);
    
    long countByStatus(String status);
    
    @Query("SELECT COUNT(o) FROM Operation o WHERE o.id_escale = :escaleId")
    int countByEscaleId(@Param("escaleId") String escaleId);
    
    @Query("SELECT COUNT(o) FROM Operation o WHERE o.id_escale = :escaleId AND o.status = :status")
    int countByEscaleIdAndStatus(@Param("escaleId") String escaleId, @Param("status") String status);
    
    @Query(value = "SELECT o.type_operation as type, COUNT(o.id_operation) as count " +
                  "FROM operation o " +
                  "GROUP BY o.type_operation", 
          nativeQuery = true)
    List<Map<String, Object>> countOperationsByType();
    
    @Query(value = "SELECT MONTH(o.date_debut) as month, COUNT(o.id_operation) as count " +
                  "FROM operation o " +
                  "WHERE YEAR(o.date_debut) = :year " +
                  "GROUP BY MONTH(o.date_debut) " +
                  "ORDER BY month", 
          nativeQuery = true)
    List<Map<String, Object>> countOperationsByMonthForYear(@Param("year") int year);
    
    @Query(value = "SELECT o.id_equipe as equipeId, COUNT(o.id_operation) as operationCount " +
                  "FROM operation o " +
                  "GROUP BY o.id_equipe", 
          nativeQuery = true)
    List<Map<String, Object>> countOperationsByEquipe();
    
    @Query(value = "SELECT COUNT(o.id_operation) " +
                  "FROM operation o " +
                  "WHERE o.id_equipe = :equipeId AND o.status = 'TERMINEE'", 
          nativeQuery = true)
    int countCompletedOperationsByEquipe(@Param("equipeId") String equipeId);
} 