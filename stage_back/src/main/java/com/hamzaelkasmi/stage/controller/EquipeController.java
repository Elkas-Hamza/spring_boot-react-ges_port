package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Equipe;
import com.hamzaelkasmi.stage.repository.EquipeRepository;
import com.hamzaelkasmi.stage.service.EquipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/equipes")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class EquipeController {

    @Autowired
    private EquipeService equipeService;
    
    @Autowired
    private EquipeRepository equipeRepository;

    @GetMapping
    public ResponseEntity<List<Equipe>> getAllEquipes() {
        try {
            List<Equipe> equipes = equipeService.getAllEquipes();
            return new ResponseEntity<>(equipes, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error retrieving all equipes: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipe> getEquipeById(@PathVariable("id") String id) {
        try {
            System.out.println("Received request to fetch equipe with ID: " + id);
            
            // Try both methods to see which one works
            var byEquipeId = equipeService.getEquipeById(id);
            var byId = equipeRepository.findById(id);
            
            System.out.println("equipeService.getEquipeById result: " + (byEquipeId.isPresent() ? "Found" : "Not Found"));
            System.out.println("equipeRepository.findById result: " + (byId.isPresent() ? "Found" : "Not Found"));
            
            if (byEquipeId.isPresent()) {
                return ResponseEntity.ok(byEquipeId.get());
            } else if (byId.isPresent()) {
                return ResponseEntity.ok(byId.get());
            }
            
            System.out.println("Equipe not found with ID: " + id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error retrieving equipe by ID: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Equipe>> searchEquipes(@RequestParam("name") String name) {
        try {
            List<Equipe> equipes = equipeService.searchEquipesByName(name);
            return new ResponseEntity<>(equipes, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error searching equipes: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/personnel/{personnelId}")
    public ResponseEntity<List<Equipe>> getEquipesByPersonnel(@PathVariable("personnelId") String personnelId) {
        try {
            List<Equipe> equipes = equipeService.getEquipesByPersonnelId(personnelId);
            return new ResponseEntity<>(equipes, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error retrieving equipes by personnel: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/soustraiteur/{soustraiteurId}")
    public ResponseEntity<List<Equipe>> getEquipesBySoustraiteur(@PathVariable("soustraiteurId") String soustraiteurId) {
        try {
            List<Equipe> equipes = equipeService.getEquipesBySoustraiteurId(soustraiteurId);
            return new ResponseEntity<>(equipes, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error retrieving equipes by soustraiteur: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<Equipe> createEquipe(@RequestBody Equipe equipe) {
        try {
            if (equipe.getNom_equipe() == null || equipe.getNom_equipe().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            System.out.println("Creating equipe with name: " + equipe.getNom_equipe());
            Equipe savedEquipe = equipeService.saveEquipe(equipe);
            System.out.println("Equipe created with ID: " + savedEquipe.getId_equipe());
            
            // Verify the equipe is immediately retrievable
            var verifyEquipe = equipeService.getEquipeById(savedEquipe.getId_equipe());
            if (verifyEquipe.isPresent()) {
                System.out.println("Verified equipe can be retrieved via getEquipeById after creation");
            } else {
                System.out.println("WARNING: Created equipe cannot be retrieved via getEquipeById immediately");
                
                // Try direct repository access
                var verifyEquipeRepo = equipeRepository.findById(savedEquipe.getId_equipe());
                if (verifyEquipeRepo.isPresent()) {
                    System.out.println("Verified equipe can be retrieved via repository after creation");
                } else {
                    System.out.println("WARNING: Created equipe cannot be retrieved via repository immediately");
                }
            }
            
            return new ResponseEntity<>(savedEquipe, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error creating equipe: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipe> updateEquipe(@PathVariable("id") String id, @RequestBody Equipe updatedEquipe) {
        try {
            return equipeService.getEquipeById(id)
                    .map(existingEquipe -> {
                        Equipe savedEquipe = equipeService.updateEquipe(id, updatedEquipe);
                        return new ResponseEntity<>(savedEquipe, HttpStatus.OK);
                    })
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            System.err.println("Error updating equipe: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipe(@PathVariable("id") String id) {
        try {
            if (equipeService.getEquipeById(id).isPresent()) {
                equipeService.deleteEquipe(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error deleting equipe: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/{id}/personnel")
    public ResponseEntity<Object> addPersonnelToEquipe(
            @PathVariable("id") String equipeId,
            @RequestBody Map<String, String> request) {
        try {
            System.out.println("Received request to add personnel to equipe: " + equipeId);
            System.out.println("Request body: " + request);
            
            String personnelId = request.get("personnelId");
            System.out.println("Personnel ID extracted from request: " + personnelId);
            
            if (personnelId == null) {
                System.out.println("Personnel ID is null, returning BAD_REQUEST");
                return new ResponseEntity<>("Personnel ID is required", HttpStatus.BAD_REQUEST);
            }
            
            // Verify equipe exists
            var equipe = equipeService.getEquipeById(equipeId);
            if (equipe.isEmpty()) {
                System.out.println("Equipe not found with ID: " + equipeId);
                return new ResponseEntity<>("Equipe not found with ID: " + equipeId, HttpStatus.NOT_FOUND);
            }
            
            Equipe updatedEquipe = equipeService.addPersonnelToEquipe(equipeId, personnelId);
            System.out.println("Successfully added personnel to equipe");
            return new ResponseEntity<>(updatedEquipe, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Error adding personnel to equipe: " + e.getMessage());
            e.printStackTrace();
            
            if (e.getMessage().contains("doesn't have a default value") || 
                e.getMessage().contains("Incorrect integer value")) {
                System.err.println("SQL schema mismatch detected");
                
                // Return meaningful error for debugging
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Database schema mismatch");
                errorResponse.put("message", e.getMessage());
                errorResponse.put("solution", "Contact system administrator to fix the database schema");
                
                return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            
            return new ResponseEntity<>("Error adding personnel to equipe: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            System.err.println("Error adding personnel to equipe: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Unexpected error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @DeleteMapping("/{id}/personnel/{personnelId}")
    public ResponseEntity<Equipe> removePersonnelFromEquipe(
            @PathVariable("id") String equipeId,
            @PathVariable("personnelId") String personnelId) {
        try {
            Equipe updatedEquipe = equipeService.removePersonnelFromEquipe(equipeId, personnelId);
            return new ResponseEntity<>(updatedEquipe, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Error removing personnel from equipe: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error removing personnel from equipe: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/{id}/soustraiteur")
    public ResponseEntity<Object> addSoustraiteurToEquipe(
            @PathVariable("id") String equipeId,
            @RequestBody Map<String, String> request) {
        try {
            System.out.println("Received request to add soustraiteur to equipe: " + equipeId);
            System.out.println("Request body: " + request);
            
            String soustraiteurId = request.get("soustraiteurId");
            System.out.println("Soustraiteur ID extracted from request: " + soustraiteurId);
            
            if (soustraiteurId == null) {
                System.out.println("Soustraiteur ID is null, returning BAD_REQUEST");
                return new ResponseEntity<>("Soustraiteur ID is required", HttpStatus.BAD_REQUEST);
            }
            
            // Verify equipe exists
            var equipe = equipeService.getEquipeById(equipeId);
            if (equipe.isEmpty()) {
                System.out.println("Equipe not found with ID: " + equipeId);
                return new ResponseEntity<>("Equipe not found with ID: " + equipeId, HttpStatus.NOT_FOUND);
            }
            
            Equipe updatedEquipe = equipeService.addSoustraiteurToEquipe(equipeId, soustraiteurId);
            System.out.println("Successfully added soustraiteur to equipe");
            return new ResponseEntity<>(updatedEquipe, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Error adding soustraiteur to equipe: " + e.getMessage());
            e.printStackTrace();
            
            if (e.getMessage().contains("doesn't have a default value") || 
                e.getMessage().contains("Incorrect integer value")) {
                System.err.println("SQL schema mismatch detected");
                
                // Return meaningful error for debugging
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Database schema mismatch");
                errorResponse.put("message", e.getMessage());
                errorResponse.put("solution", "Contact system administrator to fix the database schema");
                
                return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            
            return new ResponseEntity<>("Error adding soustraiteur to equipe: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            System.err.println("Error adding soustraiteur to equipe: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Unexpected error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @DeleteMapping("/{id}/soustraiteur/{soustraiteurId}")
    public ResponseEntity<Equipe> removeSoustraiteurFromEquipe(
            @PathVariable("id") String equipeId,
            @PathVariable("soustraiteurId") String soustraiteurId) {
        try {
            Equipe updatedEquipe = equipeService.removeSoustraiteurFromEquipe(equipeId, soustraiteurId);
            return new ResponseEntity<>(updatedEquipe, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Error removing soustraiteur from equipe: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error removing soustraiteur from equipe: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Simple test endpoint to verify routing
    @GetMapping("/{id}/personnel/test")
    public ResponseEntity<String> testPersonnelEndpoint(@PathVariable("id") String equipeId) {
        System.out.println("Test endpoint hit for equipe: " + equipeId);
        return ResponseEntity.ok("Test endpoint working for equipe: " + equipeId);
    }
} 