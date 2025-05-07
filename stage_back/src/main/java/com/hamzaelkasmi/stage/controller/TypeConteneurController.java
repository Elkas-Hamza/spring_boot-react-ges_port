package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.TypeConteneur;
import com.hamzaelkasmi.stage.service.TypeConteneurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/types-conteneurs")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class TypeConteneurController {

    @Autowired
    private TypeConteneurService typeConteneurService;
    
    // Initialize default types on startup
    @PostConstruct
    public void init() {
        typeConteneurService.ensureDefaultTypesExist();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<TypeConteneur>> getAllTypes() {
        List<TypeConteneur> types = typeConteneurService.getAllTypes();
        return new ResponseEntity<>(types, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<TypeConteneur> getTypeById(@PathVariable("id") Integer id) {
        Optional<TypeConteneur> typeData = typeConteneurService.getTypeById(id);
        return typeData.map(type -> new ResponseEntity<>(type, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/nom/{nom}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<TypeConteneur> getTypeByNom(@PathVariable("nom") String nom) {
        Optional<TypeConteneur> typeData = typeConteneurService.getTypeByNom(nom);
        return typeData.map(type -> new ResponseEntity<>(type, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TypeConteneur> createType(@RequestBody TypeConteneur typeConteneur) {
        try {
            // Check if type with same name already exists
            if (typeConteneurService.existsByNom(typeConteneur.getNomType())) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            
            TypeConteneur savedType = typeConteneurService.saveType(typeConteneur);
            return new ResponseEntity<>(savedType, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TypeConteneur> updateType(@PathVariable("id") Integer id, @RequestBody TypeConteneur typeConteneur) {
        Optional<TypeConteneur> typeData = typeConteneurService.getTypeById(id);
        if (typeData.isPresent()) {
            TypeConteneur existingType = typeData.get();
            
            // Check if trying to update to a name that already exists for another type
            if (!existingType.getNomType().equals(typeConteneur.getNomType()) && 
                typeConteneurService.existsByNom(typeConteneur.getNomType())) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            
            existingType.setNomType(typeConteneur.getNomType());
            existingType.setDescription(typeConteneur.getDescription());
            return new ResponseEntity<>(typeConteneurService.saveType(existingType), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteType(@PathVariable("id") Integer id) {
        try {
            // Check if this is one of the default types (NAVIRE or TERRE)
            Optional<TypeConteneur> typeOpt = typeConteneurService.getTypeById(id);
            if (typeOpt.isPresent()) {
                TypeConteneur type = typeOpt.get();
                if ("NAVIRE".equals(type.getNomType()) || "TERRE".equals(type.getNomType())) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
            }
            
            typeConteneurService.deleteType(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 