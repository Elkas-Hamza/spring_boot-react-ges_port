package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Personnel;
import com.hamzaelkasmi.stage.service.PersonnelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnel")
@CrossOrigin(origins = "*")
public class PersonnelController {

    @Autowired
    private PersonnelService personnelService;

    @GetMapping
    public List<Personnel> getAllPersonnel() {
        return personnelService.getAllPersonnel();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Personnel> getPersonnelById(@PathVariable("id") int id) {
        return personnelService.getPersonnelById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/matricule/{matricule}")
    public ResponseEntity<Personnel> getPersonnelByMatricule(@PathVariable("matricule") String matricule) {
        return Optional.ofNullable(personnelService.getPersonnelByMatricule(matricule))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Personnel> createPersonnel(@RequestBody Personnel personnel) {
        if (!isPersonnelValid(personnel)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(personnelService.savePersonnel(personnel));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Personnel> updatePersonnel(@PathVariable("id") int id, @RequestBody Personnel personnel) {
        if (!isPersonnelValid(personnel)) {
            return ResponseEntity.badRequest().build();
        }

        return personnelService.getPersonnelById(id)
                .map(existing -> {
                    personnel.setID_personnel(id);
                    return ResponseEntity.ok(personnelService.savePersonnel(personnel));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePersonnel(@PathVariable("id") int id) {
        personnelService.deletePersonnel(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isPersonnelValid(Personnel personnel) {
        return personnel != null &&
                personnel.getNOM_personnel() != null &&
                !personnel.getNOM_personnel().trim().isEmpty() &&
                personnel.getPRENOM_personnel() != null &&
                !personnel.getPRENOM_personnel().trim().isEmpty() &&
                personnel.getFONCTION_personnel() != null &&
                !personnel.getFONCTION_personnel().trim().isEmpty();
    }

}