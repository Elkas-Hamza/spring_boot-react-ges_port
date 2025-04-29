package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Engin;
import com.hamzaelkasmi.stage.service.EnginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/engins")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class EnginController {

    @Autowired
    private EnginService enginService;

    @GetMapping
    public ResponseEntity<List<Engin>> getAllEngins() {
        List<Engin> engins = enginService.getAllEngins();
        return new ResponseEntity<>(engins, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Engin> getEnginById(@PathVariable("id") String id) {
        Optional<Engin> enginData = enginService.getEnginById(id);
        if (enginData.isPresent()) {
            return new ResponseEntity<>(enginData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<Engin> createEngin(@RequestBody Engin engin) {
        try {
            Engin _engin = enginService.saveEngin(engin);
            return new ResponseEntity<>(_engin, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Engin> updateEngin(@PathVariable("id") String id, @RequestBody Engin engin) {
        Optional<Engin> enginData = enginService.getEnginById(id);
        if (enginData.isPresent()) {
            Engin _engin = enginData.get();
            _engin.setNom_engin(engin.getNom_engin());
            return new ResponseEntity<>(enginService.saveEngin(_engin), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEngin(@PathVariable("id") String id) {
        try {
            enginService.deleteEngin(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 