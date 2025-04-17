package com.hamzaelkasmi.stage.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.hamzaelkasmi.stage.service.ArretService;
import com.hamzaelkasmi.stage.model.Arret;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;



@RestController
@RequestMapping("/api/arret")
@CrossOrigin(origins = "*")
public class ArretController {

    @Autowired
    private ArretService arretService;

    @GetMapping
    public List<Arret> getAllArrets() {
        return arretService.getAllArrets();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Arret> getArretById(@PathVariable("id") int id) {
        return arretService.getArretById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Arret> createArret(@RequestBody Arret arret) {
        if (!isArretValid(arret)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(arretService.saveArret(arret));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Arret> updateArret(@PathVariable("id") int id, @RequestBody Arret arret) {
        if (!isArretValid(arret)) {
            return ResponseEntity.badRequest().build();
        }

        return arretService.getArretById(id)
                .map(existing -> {
                    arret.setID_arret(id);
                    if (arret.getDATE_FIN_arret() == null) {
                        arret.setDATE_FIN_arret(arret.getDATE_DEBUT_arret().plusHours(arret.getDURE_arret()));
                    }
                    return ResponseEntity.ok(arretService.saveArret(arret));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArret(@PathVariable("id") int id) {
        arretService.deleteArret(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isArretValid(Arret arret) {
        return arret.getMOTIF_arret() != null && !arret.getMOTIF_arret().isEmpty()
                && arret.getDURE_arret() > 0
                && arret.getNUM_escale() > 0;
    }
}