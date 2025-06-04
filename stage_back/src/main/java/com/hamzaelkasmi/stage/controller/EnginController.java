package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Engin;
import com.hamzaelkasmi.stage.service.EnginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/engins")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class EnginController {

    @Autowired
    private EnginService enginService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Engin>> getAllEngins() {
        List<Engin> engins = enginService.getAllEngins();
        return new ResponseEntity<>(engins, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Engin> getEnginById(@PathVariable("id") String id) {
        // Check if this is a comma-separated list
        if (id.contains(",")) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        Optional<Engin> enginData = enginService.getEnginById(id);
        if (enginData.isPresent()) {
            return new ResponseEntity<>(enginData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/multiple/{ids}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Engin>> getEnginsByIds(@PathVariable("ids") String ids) {
        List<String> idList = Arrays.asList(ids.split(","));
        List<Engin> engins = new ArrayList<>();
        
        for (String id : idList) {
            Optional<Engin> engin = enginService.getEnginById(id.trim());
            engin.ifPresent(engins::add);
        }
        
        if (engins.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return new ResponseEntity<>(engins, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Engin> createEngin(@RequestBody Engin engin) {
        try {
            Engin _engin = enginService.saveEngin(engin);
            return new ResponseEntity<>(_engin, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteEngin(@PathVariable("id") String id) {
        try {
            enginService.deleteEngin(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 