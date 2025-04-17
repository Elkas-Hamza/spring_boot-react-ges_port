package com.hamzaelkasmi.stage.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.hamzaelkasmi.stage.service.EscaleService;
import com.hamzaelkasmi.stage.model.Escale;

@RestController
@RequestMapping("/api/escale")
@CrossOrigin(origins = "*")
public class EscaleController {
    
    @Autowired
    private EscaleService escaleService;
    
    @GetMapping
    public ResponseEntity<List<Escale>> getAllEscales() {
        List<Escale> escales = escaleService.getAllEscales();
        return new ResponseEntity<>(escales, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Escale> getEscaleById(@PathVariable int id) {
        return escaleService.getEscaleById(id)
                .map(escale -> new ResponseEntity<>(escale, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @PostMapping
    public ResponseEntity<Escale> createEscale(@RequestBody Escale escale) {
        Escale savedEscale = escaleService.saveEscale(escale);
        return new ResponseEntity<>(savedEscale, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Escale> updateEscale(@PathVariable int id, @RequestBody Escale escale) {
        return escaleService.getEscaleById(id)
                .map(existingEscale -> {
                    escale.setnum_escale(id);
                    Escale updatedEscale = escaleService.saveEscale(escale);
                    return new ResponseEntity<>(updatedEscale, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEscale(@PathVariable int id) {
        return escaleService.getEscaleById(id)
                .map(escale -> {
                    escaleService.deleteEscale(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}