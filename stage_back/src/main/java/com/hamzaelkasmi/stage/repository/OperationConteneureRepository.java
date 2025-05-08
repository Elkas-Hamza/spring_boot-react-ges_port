package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.model.Operation;
import com.hamzaelkasmi.stage.model.OperationConteneure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperationConteneureRepository extends JpaRepository<OperationConteneure, String> {
    
    List<OperationConteneure> findByConteneure(Conteneure conteneure);
    
    List<OperationConteneure> findByOperation(Operation operation);
    
    List<OperationConteneure> findByStatus(OperationConteneure.OperationStatus status);
    
    List<OperationConteneure> findByTypeOperation(OperationConteneure.OperationType typeOperation);
    
    List<OperationConteneure> findByConteneureAndStatus(Conteneure conteneure, OperationConteneure.OperationStatus status);
} 