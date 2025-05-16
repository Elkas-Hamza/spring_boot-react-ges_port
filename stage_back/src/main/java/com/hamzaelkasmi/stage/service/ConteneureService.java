package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.model.Operation;
import com.hamzaelkasmi.stage.repository.ConteneureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConteneureService {

    @Autowired
    private ConteneureRepository conteneureRepository;

    public List<Conteneure> getAllConteneures() {
        return conteneureRepository.findAll();
    }

    public Optional<Conteneure> getConteneureById(String id) {
        return conteneureRepository.findById(id);
    }    @Transactional
    public Conteneure saveConteneure(Conteneure conteneure) {
        // If this is a new container (no ID), set the date added
        if (conteneure.getId_conteneure() == null) {
            conteneure.setDateAjout(new Date());
        }
        
        // Handle potential duplicate key issues with retries
        int maxRetries = 3;
        for (int attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return conteneureRepository.save(conteneure);
            } catch (Exception e) {
                if (e.getMessage().contains("Duplicate entry") && 
                    e.getMessage().contains("PRIMARY") && 
                    attempt < maxRetries - 1) {
                    // ID conflict, clear the ID to let the generator create a new one
                    System.out.println("Duplicate container ID detected, retrying with a new ID (attempt " + (attempt + 1) + ")");
                    conteneure.setId_conteneure(null);
                    continue;
                }
                throw e; // Re-throw if it's not a duplicate key or we've exhausted retries
            }
        }
        
        // This line won't be reached due to the return or throw above,
        // but is needed for compilation
        return null;
    }

    @Transactional
    public void deleteConteneure(String id) {
        conteneureRepository.deleteById(id);
    }
    
    // Get containers at the port (id_type = 1)
    public List<Conteneure> getPortConteneures() {
        return conteneureRepository.findAll().stream()
            .filter(c -> c.getNavire() == null)
            .collect(Collectors.toList());
    }
    
    // Get containers on a specific ship
    public List<Conteneure> getShipConteneures(Navire navire) {
        return conteneureRepository.findAll().stream()
            .filter(c -> c.getNavire() != null 
                && c.getNavire().getIdNavire().equals(navire.getIdNavire()))
            .collect(Collectors.toList());
    }
    
    // Assign container to ship
    @Transactional
    public Conteneure assignConteneureToShip(String conteneureId, Navire navire) {
        Optional<Conteneure> conteneureOpt = conteneureRepository.findById(conteneureId);
        if (!conteneureOpt.isPresent()) {
            return null;
        }
        
        Conteneure conteneure = conteneureOpt.get();
        
        // Update container ship reference
        conteneure.setNavire(navire);
        
        // Set ID_type to 2 for ship containers
        conteneure.setId_type(2);
        
        // Save changes
        return conteneureRepository.save(conteneure);
    }
    
    // Unassign container from ship
    @Transactional
    public Conteneure unassignConteneureFromShip(String conteneureId) {
        Optional<Conteneure> conteneureOpt = conteneureRepository.findById(conteneureId);
        if (!conteneureOpt.isPresent()) {
            return null;
        }
        
        Conteneure conteneure = conteneureOpt.get();
        
        // Remove ship reference
        conteneure.setNavire(null);
        
        // Set ID_type to 1 for port containers
        conteneure.setId_type(1);
        
        // Save changes
        return conteneureRepository.save(conteneure);
    }
}