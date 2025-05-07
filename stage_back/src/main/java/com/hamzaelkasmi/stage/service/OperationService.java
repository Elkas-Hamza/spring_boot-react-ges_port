package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.dto.OperationWithDetailsDTO;
import com.hamzaelkasmi.stage.model.Operation;
import com.hamzaelkasmi.stage.repository.OperationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OperationService {

    @Autowired
    private OperationRepository operationRepository;

    public List<Operation> getAllOperations() {
        return operationRepository.findAll();
    }

    public Optional<Operation> getOperationById(String id) {
        return operationRepository.findById(id);
    }

    public List<Operation> getOperationsByEscaleId(String escaleId) {
        return operationRepository.findByEscaleId(escaleId);
    }

    public List<Operation> getOperationsByShiftId(String shiftId) {
        return operationRepository.findByShiftId(shiftId);
    }

    public List<Operation> getOperationsByEquipeId(String equipeId) {
        return operationRepository.findByEquipeId(equipeId);
    }

    public Operation saveOperation(Operation operation) {
        return operationRepository.save(operation);
    }

    public void deleteOperation(String id) {
        operationRepository.deleteById(id);
    }
    
    public List<OperationWithDetailsDTO> getAllOperationsWithDetails() {
        List<Object[]> results = operationRepository.findAllWithShiftDetails();
        List<OperationWithDetailsDTO> dtos = new ArrayList<>();
        
        for (Object[] result : results) {
            try {
                OperationWithDetailsDTO dto = mapToDTO(result);
                dtos.add(dto);
            } catch (Exception e) {
                // Log the error and continue with the next result
                System.err.println("Error mapping operation to DTO: " + e.getMessage());
            }
        }
        
        return dtos;
    }
    
    public Optional<OperationWithDetailsDTO> getOperationWithDetailsById(String id) {
        try {
            Optional<Object[]> result = operationRepository.findByIdWithShiftDetails(id);
            return result.map(res -> {
                try {
                    return mapToDTO(res);
                } catch (Exception e) {
                    System.err.println("Error mapping operation with ID " + id + " to DTO: " + e.getMessage());
                    return null;
                }
            });
        } catch (Exception e) {
            System.err.println("Error retrieving operation with ID " + id + ": " + e.getMessage());
            return Optional.empty();
        }
    }
    
    private OperationWithDetailsDTO mapToDTO(Object[] result) {
        if (result == null) {
            throw new IllegalArgumentException("Result array cannot be null");
        }
        
        // Print out the result array for debugging
        System.out.println("Result array length: " + result.length);
        for (int i = 0; i < result.length; i++) {
            System.out.println("Index " + i + ": " + (result[i] != null ? result[i].toString() : "null") + 
                              " (Class: " + (result[i] != null ? result[i].getClass().getName() : "null") + ")");
        }
        
        OperationWithDetailsDTO dto = new OperationWithDetailsDTO();
        
        try {
            // Map based on expected column names from the query
            // ID_operation, NOM_operation, ID_shift, ID_escale, ID_conteneure, ID_engin, ID_equipe, DATE_debut, DATE_fin, nom_shift
            
            // Always get ID_operation (should be first column at index 0)
            dto.setId_operation((String) result[0]);
            
            int currentIndex = 1;
            
            // Check for NOM_operation (this could be at index 1 if it exists)
            if (result.length > 9) { // Total expected is at least 10 columns with NOM_operation
                dto.setNom_operation((String) result[currentIndex++]);
            }
            
            // Get the rest of the columns in order
            dto.setId_shift((String) result[currentIndex++]);
            dto.setId_escale((String) result[currentIndex++]);
            dto.setId_conteneure((String) result[currentIndex++]);
            dto.setId_engin((String) result[currentIndex++]);
            dto.setId_equipe((String) result[currentIndex++]);
            
            // Handle date columns with null checks
            if (result[currentIndex] != null) {
                if (result[currentIndex] instanceof Timestamp) {
                    dto.setDate_debut(((Timestamp) result[currentIndex]).toLocalDateTime());
                } else if (result[currentIndex] instanceof LocalDateTime) {
                    dto.setDate_debut((LocalDateTime) result[currentIndex]);
                }
            }
            currentIndex++;
            
            if (result[currentIndex] != null) {
                if (result[currentIndex] instanceof Timestamp) {
                    dto.setDate_fin(((Timestamp) result[currentIndex]).toLocalDateTime());
                } else if (result[currentIndex] instanceof LocalDateTime) {
                    dto.setDate_fin((LocalDateTime) result[currentIndex]);
                }
            }
            currentIndex++;
            
            // The last column should be nom_shift
            if (result.length > currentIndex) {
                dto.setNom_shift((String) result[currentIndex]);
            }
            
        } catch (Exception e) {
            System.err.println("Error during DTO mapping: " + e.getMessage());
            throw e; // Rethrow to be caught by the calling method
        }
        
        return dto;
    }
} 