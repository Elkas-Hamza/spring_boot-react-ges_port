package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Soustraiteure;
import com.hamzaelkasmi.stage.service.SoustraiteureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/soustraiteure")
@CrossOrigin(origins = "*")
public class SoustraiteureController {

    @Autowired
    private SoustraiteureService soustraiteureService;

    @GetMapping
    public List<Soustraiteure> getAllSoustraiteure() {
        return soustraiteureService.getAllSoustraiteure();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Soustraiteure> getSoustraiteureById(@PathVariable("id") int id) {
        return soustraiteureService.getSoustraiteureById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/matricule/{matricule}")
    public ResponseEntity<Soustraiteure> getSoustraiteureByMatricule(@PathVariable("matricule") String matricule) {
        return Optional.ofNullable(soustraiteureService.getSoustraiteureByMatricule(matricule))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Soustraiteure> createSoustraiteure(@RequestBody Soustraiteure soustraiteure) {
        if (!isSoustraiteureValid(soustraiteure)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(soustraiteureService.saveSoustraiteure(soustraiteure));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Soustraiteure> updateSoustraiteure(@PathVariable("id") int id, @RequestBody Soustraiteure soustraiteure) {
        if (!isSoustraiteureValid(soustraiteure)) {
            return ResponseEntity.badRequest().build();
        }

        return soustraiteureService.getSoustraiteureById(id)
                .map(existing -> {
                    soustraiteure.setID_soustraiteure(id);
                    return ResponseEntity.ok(soustraiteureService.saveSoustraiteure(soustraiteure));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSoustraiteure(@PathVariable("id") int id) {
        soustraiteureService.deleteSoustraiteure(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isSoustraiteureValid(Soustraiteure soustraiteure) {
        return soustraiteure != null &&
                soustraiteure.getNOM_soustraiteure() != null &&
                !soustraiteure.getNOM_soustraiteure().trim().isEmpty() &&
                soustraiteure.getPRENOM_soustraiteure() != null &&
                !soustraiteure.getPRENOM_soustraiteure().trim().isEmpty() &&
                soustraiteure.getFONCTION_soustraiteure() != null &&
                !soustraiteure.getFONCTION_soustraiteure().trim().isEmpty();
    }
}