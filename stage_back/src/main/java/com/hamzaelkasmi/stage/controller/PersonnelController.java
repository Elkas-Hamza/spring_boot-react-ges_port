package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Personnel;
import com.hamzaelkasmi.stage.service.PersonnelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personnel")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class PersonnelController {

    @Autowired
    private PersonnelService personnelService;

    @GetMapping
    public List<Personnel> getAllPersonnel() {
        return personnelService.getAllPersonnel();
    }

    @GetMapping("/{matricule}")
    public ResponseEntity<Personnel> getPersonnelById(@PathVariable("matricule") String matricule) {
        return personnelService.getPersonnelById(matricule)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Personnel> createPersonnel(@RequestBody Personnel personnel) {
        if (!isPersonnelValidForCreation(personnel)) {
            return ResponseEntity.badRequest().build();
        }
        
        // Force matricule to be null so it will be generated
        personnel.setMATRICULE_personnel(null);
        
        // Save personnel
        Personnel savedPersonnel = personnelService.savePersonnel(personnel);
        return ResponseEntity.ok(savedPersonnel);
    }

    @PutMapping("/{matricule}")
    public ResponseEntity<Personnel> updatePersonnel(@PathVariable("matricule") String matricule, @RequestBody Personnel personnel) {
        if (!isPersonnelValidForUpdate(personnel)) {
            return ResponseEntity.badRequest().build();
        }

        return personnelService.getPersonnelById(matricule)
                .map(existing -> {
                    personnel.setMATRICULE_personnel(matricule);
                    return ResponseEntity.ok(personnelService.savePersonnel(personnel));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{matricule}")
    public ResponseEntity<Void> deletePersonnel(@PathVariable("matricule") String matricule) {
        personnelService.deletePersonnel(matricule);
        return ResponseEntity.noContent().build();
    }

    // Method used for creation
    private boolean isPersonnelValidForCreation(Personnel personnel) {
        return personnel != null &&
                personnel.getNOM_personnel() != null &&
                !personnel.getNOM_personnel().trim().isEmpty() &&
                personnel.getPRENOM_personnel() != null &&
                !personnel.getPRENOM_personnel().trim().isEmpty() &&
                personnel.getFONCTION_personnel() != null &&
                !personnel.getFONCTION_personnel().trim().isEmpty();
    }

    // Method used for updates
    private boolean isPersonnelValidForUpdate(Personnel personnel) {
        return personnel != null &&
                personnel.getNOM_personnel() != null &&
                !personnel.getNOM_personnel().trim().isEmpty() &&
                personnel.getPRENOM_personnel() != null &&
                !personnel.getPRENOM_personnel().trim().isEmpty() &&
                personnel.getFONCTION_personnel() != null &&
                !personnel.getFONCTION_personnel().trim().isEmpty();
    }
}