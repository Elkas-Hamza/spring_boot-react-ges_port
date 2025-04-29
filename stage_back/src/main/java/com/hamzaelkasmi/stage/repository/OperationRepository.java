package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
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
} 