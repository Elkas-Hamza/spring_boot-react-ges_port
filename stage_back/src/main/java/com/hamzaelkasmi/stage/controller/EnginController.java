package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Engin;
import com.hamzaelkasmi.stage.service.EnginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/engins")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class EnginController {

    @Autowired
    private EnginService enginService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Engin>> getAllEngins() {
        List<Engin> engins = enginService.getAllEngins();
        return new ResponseEntity<>(engins, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Engin> getEnginById(@PathVariable("id") String id) {
        // Check if this is a comma-separated list
        if (id.contains(",")) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Optional<Engin> enginData = enginService.getEnginById(id);
        if (enginData.isPresent()) {
            return new ResponseEntity<>(enginData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/multiple/{ids}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Engin>> getEnginsByIds(@PathVariable("ids") String ids) {
        List<String> idList = Arrays.asList(ids.split(","));
        List<Engin> engins = new ArrayList<>();

        for (String id : idList) {
            Optional<Engin> engin = enginService.getEnginById(id.trim());
            engin.ifPresent(engins::add);
        }

        if (engins.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(engins, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createEngin(@RequestBody Engin engin) {
        try {
            // Validate input
            if (engin.getNom_engin() == null || engin.getNom_engin().trim().isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Le nom de l'engin est requis"), HttpStatus.BAD_REQUEST);
            }

            if (engin.getType_engin() == null || engin.getType_engin().trim().isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Le type de l'engin est requis"), HttpStatus.BAD_REQUEST);
            }

            // Check length constraints
            if (engin.getNom_engin().length() > 45) {
                return new ResponseEntity<>(Map.of("error", "Le nom de l'engin ne peut pas dépasser 45 caractères"),
                        HttpStatus.BAD_REQUEST);
            }

            if (engin.getType_engin().length() > 45) {
                return new ResponseEntity<>(Map.of("error", "Le type de l'engin ne peut pas dépasser 45 caractères"),
                        HttpStatus.BAD_REQUEST);
            }

            Engin _engin = enginService.saveEngin(engin);
            return new ResponseEntity<>(_engin, HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            // Handle duplicate name constraint
            if (e.getMessage().contains("NOM_engin_UNIQUE")) {
                return new ResponseEntity<>(Map.of("error", "Un engin avec ce nom existe déjà"), HttpStatus.CONFLICT);
            } else {
                return new ResponseEntity<>(Map.of("error", "Erreur de contrainte de données: " + e.getMessage()),
                        HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            e.printStackTrace(); // Log the full error for debugging
            return new ResponseEntity<>(Map.of("error", "Erreur interne du serveur: " + e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Engin> updateEngin(@PathVariable("id") String id, @RequestBody Engin engin) {
        Optional<Engin> enginData = enginService.getEnginById(id);
        if (enginData.isPresent()) {
            Engin _engin = enginData.get();
            _engin.setNom_engin(engin.getNom_engin());
            _engin.setType_engin(engin.getType_engin()); // Fix: Also update type_engin
            return new ResponseEntity<>(enginService.saveEngin(_engin), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteEngin(@PathVariable("id") String id) {
        try {
            enginService.deleteEngin(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}