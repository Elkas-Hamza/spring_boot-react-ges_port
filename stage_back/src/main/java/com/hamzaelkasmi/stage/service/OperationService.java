package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Operation;
import com.hamzaelkasmi.stage.repository.OperationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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
} 