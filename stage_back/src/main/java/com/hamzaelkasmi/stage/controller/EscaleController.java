package com.hamzaelkasmi.stage.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.hamzaelkasmi.stage.service.EscaleService;
import com.hamzaelkasmi.stage.model.Escale;

import java.util.List;

@RestController
@RequestMapping("/api/escales")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class EscaleController {

    @Autowired
    private EscaleService escaleService;

    @GetMapping
    public ResponseEntity<List<Escale>> getAllEscales() {
        try {
            List<Escale> escales = escaleService.getAllEscales();
            return new ResponseEntity<>(escales, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error retrieving all escales: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Escale> getEscaleById(@PathVariable("id") String id) {
        try {
            return escaleService.getEscaleById(id)
                    .map(ResponseEntity::ok)
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            System.err.println("Error retrieving escale by ID: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<Escale> createEscale(@RequestBody Escale escale) {
        try {
            // Basic validation
            if (escale == null || 
                escale.getNOM_navire() == null || escale.getNOM_navire().isEmpty() ||
                escale.getMATRICULE_navire() == null || escale.getMATRICULE_navire().isEmpty() ||
                escale.getDATE_accostage() == null || 
                escale.getDATE_sortie() == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            Escale savedEscale = escaleService.saveEscale(escale);
            return new ResponseEntity<>(savedEscale, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error creating escale: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error creating escale: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Escale> updateEscale(@PathVariable("id") String id, @RequestBody Escale updatedEscale) {
        try {
            if (updatedEscale == null || 
                updatedEscale.getNOM_navire() == null || updatedEscale.getNOM_navire().isEmpty() ||
                updatedEscale.getMATRICULE_navire() == null || updatedEscale.getMATRICULE_navire().isEmpty() ||
                updatedEscale.getDATE_accostage() == null || 
                updatedEscale.getDATE_sortie() == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            return escaleService.getEscaleById(id)
                    .map(existingEscale -> {
                        existingEscale.setNOM_navire(updatedEscale.getNOM_navire());
                        existingEscale.setMATRICULE_navire(updatedEscale.getMATRICULE_navire());
                        existingEscale.setDATE_accostage(updatedEscale.getDATE_accostage());
                        existingEscale.setDATE_sortie(updatedEscale.getDATE_sortie());

                        Escale savedEscale = escaleService.saveEscale(existingEscale);
                        return new ResponseEntity<>(savedEscale, HttpStatus.OK);
                    })
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error updating escale: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error updating escale: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEscale(@PathVariable("id") String id) {
        try {
            if (escaleService.getEscaleById(id).isPresent()) {
                escaleService.deleteEscale(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error deleting escale: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}