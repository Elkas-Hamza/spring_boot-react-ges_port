package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.service.NavireService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/navires")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class NavireController {

    private static final Logger logger = LoggerFactory.getLogger(NavireController.class);

    @Autowired
    private NavireService navireService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Navire>> getAllNavires() {
        List<Navire> navires = navireService.getAllNavires();
        return new ResponseEntity<>(navires, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Navire> getNavireById(@PathVariable("id") String id) {
        Optional<Navire> navireData = navireService.getNavireById(id);
        return navireData.map(navire -> new ResponseEntity<>(navire, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/matricule/{matricule}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Navire> getNavireByMatricule(@PathVariable("matricule") String matricule) {
        Optional<Navire> navireData = navireService.getNavireByMatricule(matricule);
        return navireData.map(navire -> new ResponseEntity<>(navire, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/nom/{nom}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Navire> getNavireByNom(@PathVariable("nom") String nom) {
        Optional<Navire> navireData = navireService.getNavireByNom(nom);
        return navireData.map(navire -> new ResponseEntity<>(navire, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Navire> createNavire(@RequestBody Navire navire) {
        try {
            logger.info("Creating new navire: {}", navire);
            
            if (navireService.existsByMatricule(navire.getMatriculeNavire())) {
                logger.warn("Navire with matricule {} already exists", navire.getMatriculeNavire());
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            
            // Ensure idNavire is null so the ID generator will be used
            navire.setIdNavire(null);
            
            Navire _navire = navireService.saveNavire(navire);
            logger.info("Created navire with ID: {}", _navire.getIdNavire());
            return new ResponseEntity<>(_navire, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating navire: {}", e.getMessage(), e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Navire> updateNavire(@PathVariable("id") String id, @RequestBody Navire navire) {
        try {
            logger.info("Updating navire with ID: {}", id);
            Optional<Navire> navireData = navireService.getNavireById(id);
            
            if (navireData.isPresent()) {
                Navire _navire = navireData.get();
                _navire.setNomNavire(navire.getNomNavire());
                _navire.setMatriculeNavire(navire.getMatriculeNavire());
                _navire.setIdConteneure(navire.getIdConteneure());
                
                Navire updatedNavire = navireService.saveNavire(_navire);
                logger.info("Updated navire: {}", updatedNavire);
                return new ResponseEntity<>(updatedNavire, HttpStatus.OK);
            } else {
                logger.warn("Navire with ID {} not found", id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error updating navire: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteNavire(@PathVariable("id") String id) {
        try {
            logger.info("Deleting navire with ID: {}", id);
            navireService.deleteNavire(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting navire: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 