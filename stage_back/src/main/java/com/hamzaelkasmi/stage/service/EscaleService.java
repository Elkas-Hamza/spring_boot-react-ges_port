package com.hamzaelkasmi.stage.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.hamzaelkasmi.stage.model.Escale;
import com.hamzaelkasmi.stage.model.Navire;
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
        if (escale.getDATE_accostage() == null || escale.getDATE_sortie() == null) {
            throw new IllegalArgumentException("DATE_accostage and DATE_sortie must not be null");
        }
        
        // Handle navire reference
        if (escale.getNavire() != null && escale.getNavire().getIdNavire() != null) {
            // Check if the navire exists
            Optional<Navire> navireOpt = navireRepository.findById(escale.getNavire().getIdNavire());
            if (navireOpt.isPresent()) {
                // Use the existing navire to avoid creating duplicates
                escale.setNavire(navireOpt.get());
            } else {
                // If navire doesn't exist, try to load by matricule
                if (escale.getNavire().getMatriculeNavire() != null) {
                    Optional<Navire> navireByMatricule = navireRepository.findByMatriculeNavire(escale.getNavire().getMatriculeNavire());
                    if (navireByMatricule.isPresent()) {
                        escale.setNavire(navireByMatricule.get());
                    } else {
                        // If no navire with this matricule exists, set to null
                        escale.setNavire(null);
                    }
                } else {
                    // If no matricule provided, set to null
                    escale.setNavire(null);
                }
            }
        }

        // Save the escale (the database trigger will generate NUM_escale if not provided)
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