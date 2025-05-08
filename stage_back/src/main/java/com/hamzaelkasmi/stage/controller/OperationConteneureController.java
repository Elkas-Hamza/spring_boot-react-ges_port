package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.model.Operation;
import com.hamzaelkasmi.stage.model.OperationConteneure;
import com.hamzaelkasmi.stage.service.ConteneureService;
import com.hamzaelkasmi.stage.service.OperationConteneureService;
import com.hamzaelkasmi.stage.service.OperationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/operation-conteneurs")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class OperationConteneureController {

    @Autowired
    private OperationConteneureService operationConteneureService;
    
    @Autowired
    private OperationService operationService;
    
    @Autowired
    private ConteneureService conteneureService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<OperationConteneure>> getAllOperations() {
        List<OperationConteneure> operations = operationConteneureService.getAllOperationConteneures();
        return new ResponseEntity<>(operations, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<OperationConteneure> getOperationById(@PathVariable("id") String id) {
        Optional<OperationConteneure> operation = operationConteneureService.getOperationConteneureById(id);
        return operation.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/operation/{operationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<OperationConteneure>> getOperationsByOperationId(@PathVariable("operationId") String operationId) {
        Optional<Operation> operationOpt = operationService.getOperationById(operationId);
        if (!operationOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<OperationConteneure> operations = operationConteneureService.getOperationConteneuresByOperation(operationOpt.get());
        return new ResponseEntity<>(operations, HttpStatus.OK);
    }
    
    @GetMapping("/container/{containerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<OperationConteneure>> getOperationsByContainerId(@PathVariable("containerId") String containerId) {
        Optional<Conteneure> conteneureOpt = conteneureService.getConteneureById(containerId);
        if (!conteneureOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<OperationConteneure> operations = operationConteneureService.getOperationConteneuresByConteneure(conteneureOpt.get());
        return new ResponseEntity<>(operations, HttpStatus.OK);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<OperationConteneure>> getOperationsByStatus(@PathVariable("status") String status) {
        try {
            OperationConteneure.OperationStatus operationStatus = OperationConteneure.OperationStatus.valueOf(status.toUpperCase());
            List<OperationConteneure> operations = operationConteneureService.getOperationConteneuresByStatus(operationStatus);
            return new ResponseEntity<>(operations, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OperationConteneure> createOperation(@RequestBody OperationConteneure operation) {
        try {
            operation.setId_operation_conteneure(null); // Ensure ID is null for auto-generation
            OperationConteneure saved = operationConteneureService.saveOperationConteneure(operation);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OperationConteneure> updateOperation(@PathVariable("id") String id, @RequestBody OperationConteneure operation) {
        Optional<OperationConteneure> existingOpt = operationConteneureService.getOperationConteneureById(id);
        if (!existingOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        operation.setId_operation_conteneure(id);
        OperationConteneure updated = operationConteneureService.saveOperationConteneure(operation);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }
    
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OperationConteneure> completeOperation(@PathVariable("id") String id) {
        OperationConteneure completed = operationConteneureService.markOperationAsComplete(id);
        if (completed == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(completed, HttpStatus.OK);
    }
    
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OperationConteneure> cancelOperation(@PathVariable("id") String id) {
        OperationConteneure cancelled = operationConteneureService.cancelOperation(id);
        if (cancelled == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(cancelled, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteOperation(@PathVariable("id") String id) {
        try {
            operationConteneureService.deleteOperationConteneure(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 