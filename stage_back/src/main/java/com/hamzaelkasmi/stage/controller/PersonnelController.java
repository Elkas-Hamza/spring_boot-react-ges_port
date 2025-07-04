package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Personnel;
import com.hamzaelkasmi.stage.service.PersonnelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personnel")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class PersonnelController {

    @Autowired
    private PersonnelService personnelService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public List<Personnel> getAllPersonnel() {
        return personnelService.getAllPersonnel();
    }

    @GetMapping("/{matricule}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<Personnel> getPersonnelById(@PathVariable("matricule") String matricule) {
        return personnelService.getPersonnelByMatricule(matricule)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/equipe/{equipeId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<Personnel>> getPersonnelByEquipeId(@PathVariable("equipeId") String equipeId) {
        List<Personnel> personnel = personnelService.getPersonnelByEquipeId(equipeId);
        return ResponseEntity.ok(personnel);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Personnel> createPersonnel(@RequestBody Personnel personnel) {
        if (!isPersonnelValidForCreation(personnel)) {
            return ResponseEntity.badRequest().build();
        }

        // Force matricule to be null so it will be generated
        personnel.setMATRICULE_personnel(null);

        // Generate a simple ID_personnel value (you can make this more sophisticated)
        personnel.setID_personnel((int) (System.currentTimeMillis() % 100000));

        // Save personnel
        Personnel savedPersonnel = personnelService.savePersonnel(personnel);
        return ResponseEntity.ok(savedPersonnel);
    }

    @PutMapping("/{matricule}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Personnel> updatePersonnel(@PathVariable("matricule") String matricule,
            @RequestBody Personnel personnel) {
        if (!isPersonnelValidForUpdate(personnel)) {
            return ResponseEntity.badRequest().build();
        }

        return personnelService.getPersonnelByMatricule(matricule)
                .map(existing -> {
                    // Copy ID_personnel from existing entity
                    personnel.setID_personnel(existing.getID_personnel());
                    personnel.setMATRICULE_personnel(matricule);
                    return ResponseEntity.ok(personnelService.savePersonnel(personnel));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{matricule}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePersonnel(@PathVariable("matricule") String matricule) {
        personnelService.deletePersonnelByMatricule(matricule);
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