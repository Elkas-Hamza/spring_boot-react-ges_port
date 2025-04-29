package com.hamzaelkasmi.stage.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.hamzaelkasmi.stage.service.ArretService;
import com.hamzaelkasmi.stage.model.Arret;

import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/arrets")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class ArretController {

    @Autowired
    private ArretService arretService;

    /**
     * Retrieve all arrets from the database.
     */
    @GetMapping
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
    public ResponseEntity<Arret> createArret(@RequestBody Arret arret) {
        try {
            if (!isArretValid(arret)) {
                return ResponseEntity.badRequest().body(null);
            }

            Arret savedArret = arretService.saveArret(arret);
            return ResponseEntity.ok(savedArret);
        } catch (Exception e) {
            // Log the exception for debugging
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Update an existing arret.
     */
    @PutMapping("/{id}")
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

                        // Calculate DATE_FIN_arret if not provided
                        if (updatedArret.getDATE_FIN_arret() == null) {
                            existingArret.setDATE_FIN_arret(
                                    updatedArret.getDATE_DEBUT_arret().plusHours(updatedArret.getDURE_arret())
                            );
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
        return arret != null
                && arret.getNUM_escale() != null && !arret.getNUM_escale().isEmpty()
                && arret.getMOTIF_arret() != null && !arret.getMOTIF_arret().isEmpty()
                && arret.getDURE_arret() > 0
                && arret.getDATE_DEBUT_arret() != null;
    }
}