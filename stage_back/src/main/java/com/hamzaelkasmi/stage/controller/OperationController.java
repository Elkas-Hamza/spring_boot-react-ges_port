package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.dto.OperationWithDetailsDTO;
import com.hamzaelkasmi.stage.model.Operation;
import com.hamzaelkasmi.stage.service.OperationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operations")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class OperationController {

    @Autowired
    private OperationService operationService;

    @GetMapping
    public List<Operation> getAllOperations() {
        return operationService.getAllOperations();
    }

    @GetMapping("/with-details")
    public List<OperationWithDetailsDTO> getAllOperationsWithDetails() {
        return operationService.getAllOperationsWithDetails();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Operation> getOperationById(@PathVariable("id") String id) {
        return operationService.getOperationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/with-details")
    public ResponseEntity<OperationWithDetailsDTO> getOperationWithDetailsById(@PathVariable("id") String id) {
        return operationService.getOperationWithDetailsById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/escale/{escaleId}")
    public ResponseEntity<List<Operation>> getOperationsByEscaleId(@PathVariable("escaleId") String escaleId) {
        List<Operation> operations = operationService.getOperationsByEscaleId(escaleId);
        return operations.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(operations);
    }

    @GetMapping("/escale/{escaleId}/status/{status}")
    public ResponseEntity<List<Operation>> getOperationsByEscaleIdAndStatus(
            @PathVariable("escaleId") String escaleId,
            @PathVariable("status") String status) {
        List<Operation> operations = operationService.getOperationsByEscaleIdAndStatus(escaleId, status);
        return operations.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(operations);
    }

    @GetMapping("/shift/{shiftId}")
    public ResponseEntity<List<Operation>> getOperationsByShiftId(@PathVariable String shiftId) {
        List<Operation> operations = operationService.getOperationsByShiftId(shiftId);
        return ResponseEntity.ok(operations);
    }

    @GetMapping("/equipe/{equipeId}")
    public ResponseEntity<List<Operation>> getOperationsByEquipeId(@PathVariable String equipeId) {
        List<Operation> operations = operationService.getOperationsByEquipeId(equipeId);
        return ResponseEntity.ok(operations);
    }

    @PostMapping
    public ResponseEntity<Operation> createOperation(@RequestBody Operation operation) {
        if (!isOperationValid(operation)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(operationService.saveOperation(operation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Operation> updateOperation(@PathVariable("id") String id, @RequestBody Operation operation) {
        if (!isOperationValid(operation)) {
            return ResponseEntity.badRequest().build();
        }

        return operationService.getOperationById(id)
                .map(existing -> {
                    operation.setId_operation(id);
                    return ResponseEntity.ok(operationService.saveOperation(operation));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOperation(@PathVariable("id") String id) {
        operationService.deleteOperation(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isOperationValid(Operation operation) {
        return operation != null &&
                operation.getId_escale() != null &&
                !operation.getId_escale().trim().isEmpty() &&
                operation.getId_equipe() != null &&
                !operation.getId_equipe().trim().isEmpty() &&
                operation.getDate_debut() != null &&
                operation.getDate_fin() != null;
    }
}