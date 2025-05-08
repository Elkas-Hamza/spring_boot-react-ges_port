package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.*;
import com.hamzaelkasmi.stage.repository.ConteneureRepository;
import com.hamzaelkasmi.stage.repository.HistoriqueConteneureRepository;
import com.hamzaelkasmi.stage.repository.OperationConteneureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class OperationConteneureService {

    @Autowired
    private OperationConteneureRepository operationConteneureRepository;
    
    @Autowired
    private ConteneureRepository conteneureRepository;
    
    @Autowired
    private HistoriqueConteneureRepository historiqueConteneureRepository;

    public List<OperationConteneure> getAllOperationConteneures() {
        return operationConteneureRepository.findAll();
    }

    public Optional<OperationConteneure> getOperationConteneureById(String id) {
        return operationConteneureRepository.findById(id);
    }

    public List<OperationConteneure> getOperationConteneuresByConteneure(Conteneure conteneure) {
        return operationConteneureRepository.findByConteneure(conteneure);
    }
    
    public List<OperationConteneure> getOperationConteneuresByOperation(Operation operation) {
        return operationConteneureRepository.findByOperation(operation);
    }
    
    public List<OperationConteneure> getOperationConteneuresByStatus(OperationConteneure.OperationStatus status) {
        return operationConteneureRepository.findByStatus(status);
    }
    
    @Transactional
    public OperationConteneure saveOperationConteneure(OperationConteneure operationConteneure) {
        return operationConteneureRepository.save(operationConteneure);
    }
    
    @Transactional
    public void deleteOperationConteneure(String id) {
        operationConteneureRepository.deleteById(id);
    }
    
    @Transactional
    public OperationConteneure markOperationAsComplete(String id) {
        Optional<OperationConteneure> operationOpt = operationConteneureRepository.findById(id);
        if (!operationOpt.isPresent()) {
            return null;
        }
        
        OperationConteneure operation = operationOpt.get();
        Conteneure conteneure = operation.getConteneure();
        
        // Store original values for history
        Conteneure.ConteneureLocationType oldLocationType = conteneure.getType_conteneure();
        Navire oldNavire = conteneure.getNavire();
        
        // Update containeur based on operation type
        if (operation.getTypeOperation() == OperationConteneure.OperationType.CHARGEMENT) {
            conteneure.setType_conteneure(Conteneure.ConteneureLocationType.NAVIRE);
            
            // Fix the issue by directly using a Navire object or retrieving it from a service
            // If we have a NavireService, we can use it to find the navire by the escale ID
            String operationId = operation.getOperation().getId_operation();
            String escaleId = operation.getOperation().getId_escale();
            
            // For now, let's use the navire information directly if available
            if (oldNavire != null) {
                conteneure.setNavire(oldNavire);
            } else {
                // Create a placeholder navire with just the name
                Navire navire = new Navire();
                navire.setNomNavire("Navire de l'opération: " + operationId);
                conteneure.setNavire(navire);
            }
        } else if (operation.getTypeOperation() == OperationConteneure.OperationType.DECHARGEMENT) {
            conteneure.setType_conteneure(Conteneure.ConteneureLocationType.TERRE);
            conteneure.setNavire(null);
        }
        
        // Update operation status
        operation.setStatus(OperationConteneure.OperationStatus.TERMINE);
        
        // Set derniere operation reference in container
        conteneure.setDerniereOperation(operation.getOperation());
        
        // Save container
        conteneureRepository.save(conteneure);
        
        // Create history record
        HistoriqueConteneure historique = new HistoriqueConteneure(
            conteneure,
            oldLocationType,
            conteneure.getType_conteneure(),
            oldNavire,
            conteneure.getNavire(),
            operation
        );
        
        historiqueConteneureRepository.save(historique);
        
        // Save and return updated operation
        return operationConteneureRepository.save(operation);
    }
    
    @Transactional
    public OperationConteneure cancelOperation(String id) {
        Optional<OperationConteneure> operationOpt = operationConteneureRepository.findById(id);
        if (!operationOpt.isPresent()) {
            return null;
        }
        
        OperationConteneure operation = operationOpt.get();
        operation.setStatus(OperationConteneure.OperationStatus.ANNULE);
        
        return operationConteneureRepository.save(operation);
    }
} 