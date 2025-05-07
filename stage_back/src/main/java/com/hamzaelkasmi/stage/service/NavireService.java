package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.repository.NavireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NavireService {
    
    @Autowired
    private NavireRepository navireRepository;
    
    public List<Navire> getAllNavires() {
        return navireRepository.findAll();
    }
    
    public Optional<Navire> getNavireById(String id) {
        return navireRepository.findById(id);
    }
    
    public Optional<Navire> getNavireByMatricule(String matricule) {
        return navireRepository.findByMatriculeNavire(matricule);
    }
    
    public Optional<Navire> getNavireByNom(String nom) {
        return navireRepository.findByNomNavire(nom);
    }
    
    public Navire saveNavire(Navire navire) {
        return navireRepository.save(navire);
    }
    
    public void deleteNavire(String id) {
        navireRepository.deleteById(id);
    }
    
    public boolean existsByNom(String nom) {
        return navireRepository.existsByNomNavire(nom);
    }
    
    public boolean existsByMatricule(String matricule) {
        return navireRepository.existsByMatriculeNavire(matricule);
    }
    
    // Helper method to get or create a navire by name
    public Navire getOrCreateNavireByNom(String nomNavire) {
        return navireRepository.findByNomNavire(nomNavire)
            .orElseGet(() -> {
                Navire newNavire = new Navire();
                newNavire.setNomNavire(nomNavire);
                return navireRepository.save(newNavire);
            });
    }
} 