package com.hamzaelkasmi.stage.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.hamzaelkasmi.stage.model.Escale;
import com.hamzaelkasmi.stage.repository.EscaleRepository;
import com.hamzaelkasmi.stage.repository.NavireRepository;

@Service
public class EscaleService {
    @Autowired
    private EscaleRepository escaleRepository;
    
    @Autowired
    private NavireRepository navireRepository;
    
    /**
     * Retrieve all escales from the database.
     */
    public List<Escale> getAllEscales() {
        return escaleRepository.findAll();
    }

    /**
     * Retrieve an escale by its ID.
     */
    public Optional<Escale> getEscaleById(String id) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("ID must not be null or empty");
        }
        return escaleRepository.findById(id);
    }

    /**
     * Save a new escale or update an existing one.
     */
    public Escale saveEscale(Escale escale) {
        // Validate required fields
        if (escale == null) {
            throw new IllegalArgumentException("Escale object must not be null");
        }
        if (escale.getNOM_navire() == null || escale.getNOM_navire().isEmpty()) {
            throw new IllegalArgumentException("NOM_navire must not be null or empty");
        }
        if (escale.getMATRICULE_navire() == null || escale.getMATRICULE_navire().isEmpty()) {
            throw new IllegalArgumentException("MATRICULE_navire must not be null or empty");
        }
        if (escale.getDATE_accostage() == null || escale.getDATE_sortie() == null) {
            throw new IllegalArgumentException("DATE_accostage and DATE_sortie must not be null");
        }

        // Verify the navire exists before saving
        if (!navireRepository.existsByMatriculeNavire(escale.getMATRICULE_navire())) {
            throw new IllegalArgumentException("No navire found with matricule: " + escale.getMATRICULE_navire());
        }

        return escaleRepository.save(escale);
    }

    /**
     * Delete an escale by its ID.
     */
    public void deleteEscale(String id) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("ID must not be null or empty");
        }
        escaleRepository.deleteById(id);
    }
}