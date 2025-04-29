package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Soustraiteure;
import com.hamzaelkasmi.stage.service.SoustraiteureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/soustraiteurs")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class SoustraiteureController {

    @Autowired
    private SoustraiteureService soustraiteureService;

    @GetMapping
    public List<Soustraiteure> getAllSoustraiteure() {
        return soustraiteureService.getAllSoustraiteure();
    }

    @GetMapping("/{matricule}")
    public ResponseEntity<Soustraiteure> getSoustraiteureById(@PathVariable("matricule") String matricule) {
        return soustraiteureService.getSoustraiteureById(matricule)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Soustraiteure> createSoustraiteure(@RequestBody Soustraiteure soustraiteure) {
        if (!isSoustraiteureValidForCreation(soustraiteure)) {
            return ResponseEntity.badRequest().build();
        }
        
        // Force matricule to be null so it will be generated
        soustraiteure.setMATRICULE_soustraiteure(null);
        
        // Save soustraiteure
        Soustraiteure savedSoustraiteure = soustraiteureService.saveSoustraiteure(soustraiteure);
        return ResponseEntity.ok(savedSoustraiteure);
    }

    @PutMapping("/{matricule}")
    public ResponseEntity<Soustraiteure> updateSoustraiteure(@PathVariable("matricule") String matricule, @RequestBody Soustraiteure soustraiteure) {
        if (!isSoustraiteureValidForUpdate(soustraiteure)) {
            return ResponseEntity.badRequest().build();
        }

        return soustraiteureService.getSoustraiteureById(matricule)
                .map(existing -> {
                    soustraiteure.setMATRICULE_soustraiteure(matricule);
                    return ResponseEntity.ok(soustraiteureService.saveSoustraiteure(soustraiteure));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{matricule}")
    public ResponseEntity<Void> deleteSoustraiteure(@PathVariable("matricule") String matricule) {
        soustraiteureService.deleteSoustraiteure(matricule);
        return ResponseEntity.noContent().build();
    }

    // Method used for creation
    private boolean isSoustraiteureValidForCreation(Soustraiteure soustraiteure) {
        return soustraiteure != null &&
                soustraiteure.getNOM_soustraiteure() != null &&
                !soustraiteure.getNOM_soustraiteure().trim().isEmpty() &&
                soustraiteure.getPRENOM_soustraiteure() != null &&
                !soustraiteure.getPRENOM_soustraiteure().trim().isEmpty() &&
                soustraiteure.getFONCTION_soustraiteure() != null &&
                !soustraiteure.getFONCTION_soustraiteure().trim().isEmpty();
    }

    // Method used for updates
    private boolean isSoustraiteureValidForUpdate(Soustraiteure soustraiteure) {
        return soustraiteure != null &&
                soustraiteure.getNOM_soustraiteure() != null &&
                !soustraiteure.getNOM_soustraiteure().trim().isEmpty() &&
                soustraiteure.getPRENOM_soustraiteure() != null &&
                !soustraiteure.getPRENOM_soustraiteure().trim().isEmpty() &&
                soustraiteure.getFONCTION_soustraiteure() != null &&
                !soustraiteure.getFONCTION_soustraiteure().trim().isEmpty();
    }
}