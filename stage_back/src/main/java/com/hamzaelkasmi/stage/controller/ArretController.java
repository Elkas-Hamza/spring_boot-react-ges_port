package com.hamzaelkasmi.stage.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.hamzaelkasmi.stage.service.ArretService;
import com.hamzaelkasmi.stage.service.OperationService;
import com.hamzaelkasmi.stage.model.Arret;

import java.util.List;

@RestController
@RequestMapping("/api/arrets")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class ArretController {

    @Autowired
    private ArretService arretService;

    @Autowired
    private OperationService operationService;

    /**
     * Retrieve all arrets from the database.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<Arret>> getAllArrets() {
        try {
            List<Arret> arrets = arretService.getAllArrets();
            return ResponseEntity.ok(arrets);
        } catch (Exception e) {
            // Log the exception for debugging
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Retrieve an arret by its ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<Arret> getArretById(@PathVariable("id") String id) {
        try {
            return arretService.getArretById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            // Log the exception for debugging
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Create a new arret.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<Arret> createArret(@RequestBody Arret arret) {
        try {
            System.out.println("=== Received arret data ===");
            System.out.println("NUM_escale: " + arret.getNUM_escale());
            System.out.println("MOTIF_arret: " + arret.getMOTIF_arret());
            System.out.println("DURE_arret: " + arret.getDURE_arret());
            System.out.println("DATE_DEBUT_arret: " + arret.getDATE_DEBUT_arret());
            System.out.println("DATE_FIN_arret: " + arret.getDATE_FIN_arret());
            System.out.println("ID_operation: " + arret.getID_operation());

            if (!isArretValid(arret)) {
                System.out.println("Validation failed for arret");
                return ResponseEntity.badRequest().body(null);
            }
            System.out.println("Validation passed, attempting to save...");
            Arret savedArret = arretService.saveArret(arret);
            System.out.println("Arret saved successfully: " + savedArret.getID_arret());

            // If arrêt has an operation ID, update the operation status to "En pause"
            if (savedArret.getID_operation() != null && !savedArret.getID_operation().trim().isEmpty()) {
                System.out.println(
                        "Updating operation status to 'En pause' for operation: " + savedArret.getID_operation());
                boolean statusUpdated = operationService.updateOperationStatus(savedArret.getID_operation(),
                        "En pause");
                if (statusUpdated) {
                    System.out.println("Operation status updated successfully");
                } else {
                    System.out
                            .println("Warning: Failed to update operation status, but arrêt was created successfully");
                }
            }

            return ResponseEntity.ok(savedArret);
        } catch (Exception e) {
            // Log the detailed exception for debugging
            System.err.println("Error occurred while creating arret:");
            System.err.println("Exception type: " + e.getClass().getSimpleName());
            System.err.println("Exception message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Update an existing arret.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<Arret> updateArret(@PathVariable("id") String id, @RequestBody Arret updatedArret) {
        try {
            if (!isArretValid(updatedArret)) {
                return ResponseEntity.badRequest().body(null);
            }

            return arretService.getArretById(id)
                    .map(existingArret -> {
                        // Update only mutable fields
                        existingArret.setMOTIF_arret(updatedArret.getMOTIF_arret());
                        existingArret.setDURE_arret(updatedArret.getDURE_arret());
                        existingArret.setNUM_escale(updatedArret.getNUM_escale());
                        existingArret.setDATE_DEBUT_arret(updatedArret.getDATE_DEBUT_arret());
                        existingArret.setID_operation(updatedArret.getID_operation());

                        // Calculate DATE_FIN_arret if not provided
                        if (updatedArret.getDATE_FIN_arret() == null) {
                            existingArret.setDATE_FIN_arret(
                                    updatedArret.getDATE_DEBUT_arret().plusHours(updatedArret.getDURE_arret()));
                        } else {
                            existingArret.setDATE_FIN_arret(updatedArret.getDATE_FIN_arret());
                        }

                        // Save the updated entity
                        Arret savedArret = arretService.saveArret(existingArret);
                        return ResponseEntity.ok(savedArret);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            // Log the exception for debugging
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Delete an arret by its ID.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteArret(@PathVariable("id") String id) {
        try {
            arretService.deleteArret(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // Log the exception for debugging
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validate the arret object.
     */
    private boolean isArretValid(Arret arret) {
        if (arret == null) {
            System.out.println("Validation failed: arret is null");
            return false;
        }

        if (arret.getNUM_escale() == null || arret.getNUM_escale().isEmpty()) {
            System.out.println("Validation failed: NUM_escale is null or empty");
            return false;
        }

        if (arret.getMOTIF_arret() == null || arret.getMOTIF_arret().isEmpty()) {
            System.out.println("Validation failed: MOTIF_arret is null or empty");
            return false;
        }

        if (arret.getDURE_arret() <= 0) {
            System.out.println("Validation failed: DURE_arret is <= 0: " + arret.getDURE_arret());
            return false;
        }

        if (arret.getDATE_DEBUT_arret() == null) {
            System.out.println("Validation failed: DATE_DEBUT_arret is null");
            return false;
        }

        System.out.println("Validation passed");
        return true;
    }
}