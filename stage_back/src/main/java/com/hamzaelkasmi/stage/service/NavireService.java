package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.repository.NavireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@Service
public class NavireService {
    
    @Autowired
    private NavireRepository navireRepository;
    
    public List<Navire> getAllNavires() {
        List<Navire> navires = navireRepository.findAll();
        System.out.println("NavireService.getAllNavires() - Found " + navires.size() + " navires");
        // Log first few ships for debugging
        int count = 0;
        for (Navire navire : navires) {
            if (count++ < 5) { // Only log first 5 to avoid too much output
                System.out.println("NavireService - Ship: ID=" + navire.getIdNavire() + 
                    ", Name=" + navire.getNomNavire() +
                    ", Matricule=" + navire.getMatriculeNavire());
            }
        }
        return navires;
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
    
    // Helper method to ensure containers are loaded for a ship
    public Navire loadNavireWithContainers(String id) {
        Optional<Navire> navireOpt = navireRepository.findById(id);
        if (navireOpt.isPresent()) {
            Navire navire = navireOpt.get();
            
            // Force initialization of the containers collection
            if (navire.getConteneurs() != null) {
                System.out.println("Loaded " + navire.getConteneurs().size() + " containers for ship " + navire.getIdNavire());
            }
            
            return navire;
        }
        return null;
    }
    
    // Method to load all ships with their containers
    public List<Navire> getAllNaviresWithContainers() {
        List<Navire> allNavires = navireRepository.findAll();
        System.out.println("NavireService.getAllNaviresWithContainers() - Found " + allNavires.size() + " navires");
        
        // Force initialization of containers for each ship
        for (Navire navire : allNavires) {
            if (navire.getConteneurs() != null) {
                int containerCount = navire.getConteneurs().size();
                System.out.println("Ship " + navire.getIdNavire() + " has " + containerCount + " containers");
            } else {
                System.out.println("Ship " + navire.getIdNavire() + " has null containers collection");
            }
        }
        
        return allNavires;
    }
    
    // Method to get accurate container counts by navire ID using a repository query
    public Map<String, Integer> getContainerCountsByNavireId() {
        // Get all navires
        List<Navire> allNavires = navireRepository.findAll();
        Map<String, Integer> counts = new HashMap<>();
        
        // For each navire, manually count the containers
        for (Navire navire : allNavires) {
            String navireId = navire.getIdNavire();
            
            // If the containerRepository is not directly available, use EntityManager to run a custom query
            // But for now we'll use the navire objects to count containers
            int count = 0;
            if (navire.getConteneurs() != null) {
                count = navire.getConteneurs().size();
            }
            
            counts.put(navireId, count);
            System.out.println("NavireService: Ship " + navireId + " has " + count + " containers (manual count)");
        }
        
        return counts;
    }
} 