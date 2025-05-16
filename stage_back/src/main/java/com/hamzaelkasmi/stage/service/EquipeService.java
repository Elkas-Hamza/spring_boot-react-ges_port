package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Equipe;
import com.hamzaelkasmi.stage.model.Personnel;
import com.hamzaelkasmi.stage.model.Soustraiteure;
import com.hamzaelkasmi.stage.repository.EquipeRepository;
import com.hamzaelkasmi.stage.repository.PersonnelRepository;
import com.hamzaelkasmi.stage.repository.SoustraiteureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class EquipeService {

    @Autowired
    private EquipeRepository equipeRepository;
    
    @Autowired
    private PersonnelRepository personnelRepository;
    
    @Autowired
    private SoustraiteureRepository soustraiteureRepository;

    public List<Equipe> getAllEquipes() {
        return equipeRepository.findAll();
    }    @Transactional(readOnly = true)
    public Optional<Equipe> getEquipeById(String id) {
        Optional<Equipe> equipeOpt = equipeRepository.findByEquipeId(id);
        
        // Initialize collections if the equipe exists
        equipeOpt.ifPresent(equipe -> {
            if (equipe.getSoustraiteurs() != null) {
                // Force collection initialization by accessing its size
                equipe.getSoustraiteurs().size();
            }
            if (equipe.getPersonnel() != null) {
                equipe.getPersonnel().size();
            }
        });
        
        return equipeOpt;
    }
    
    @Transactional(readOnly = true)
    public Optional<Personnel> getPersonnelByMatricule(String matricule) {
        return personnelRepository.findByMatricule(matricule);
    }
    
    public List<Equipe> searchEquipesByName(String name) {
        return equipeRepository.findByNameContaining(name);
    }
    
    public List<Equipe> getEquipesByPersonnelId(String personnelId) {
        return equipeRepository.findByPersonnelId(personnelId);
    }
    
    public List<Equipe> getEquipesBySoustraiteurId(String soustraiteurId) {
        return equipeRepository.findBySoustraiteurId(soustraiteurId);
    }

    @Transactional
    public Equipe saveEquipe(Equipe equipe) {
        return equipeRepository.save(equipe);
    }
    
    @Transactional
    public Equipe updateEquipe(String id, Equipe updatedEquipe) {
        Equipe existingEquipe = getEquipeById(id)
                .orElseThrow(() -> new RuntimeException("Equipe not found with id: " + id));
        
        existingEquipe.setNom_equipe(updatedEquipe.getNom_equipe());
        // Personnel and subcontractors are managed separately
        
        return equipeRepository.save(existingEquipe);
    }
    
    @Transactional
    public void deleteEquipe(String id) {
        equipeRepository.deleteById(id);
    }    @Transactional
    public Equipe addPersonnelToEquipe(String equipeId, String personnelId) {
        Equipe equipe = getEquipeById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found with id: " + equipeId));
                
        // Find personnel by MATRICULE_personnel instead of the composite key
        Personnel personnel = personnelRepository.findByMatricule(personnelId)
                .orElseThrow(() -> new RuntimeException("Personnel not found with matricule: " + personnelId));
        
        try {
            // Get the EntityManager from the repository
            var entityManager = equipeRepository.getEntityManager();

            // Check if personnel exists in the equipe first to avoid duplicates
            try {
                var exists = entityManager.createNativeQuery(
                    "SELECT 1 FROM equipe_has_personnel " +
                    "WHERE equipe_ID_equipe = ? AND personnel_MATRICULE_personnel = ?")
                    .setParameter(1, equipeId)
                    .setParameter(2, personnelId)
                    .getResultList();
                
                if (!exists.isEmpty()) {
                    System.out.println("Personnel already exists in equipe. Skipping insertion.");
                    return equipe;
                }
            } catch (Exception e) {
                System.out.println("Error checking if personnel exists in equipe: " + e.getMessage());
                // Continue with insertion attempt
            }
            
            // Simply use JPA's association management instead of raw SQL
            equipe.addPersonnel(personnel);
            equipeRepository.save(equipe);
            
            // Refresh the equipe entity to reflect the changes
            entityManager.refresh(equipe);
            
            System.out.println("Successfully added personnel to equipe using JPA relationships");
            
            return equipe;
        } catch (Exception e) {
            throw new RuntimeException("Error adding personnel to equipe: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public Equipe removePersonnelFromEquipe(String equipeId, String personnelId) {
        Equipe equipe = getEquipeById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found with id: " + equipeId));
                
        // We don't need to check if personnel exists, just attempt to remove
        try {
            // Get the EntityManager from the repository
            var entityManager = equipeRepository.getEntityManager();
            
            // Delete query - will work even if no rows match (will just affect 0 rows)
            int rowsAffected = entityManager.createNativeQuery(
                    "DELETE FROM equipe_has_personnel WHERE equipe_ID_equipe = ? AND personnel_MATRICULE_personnel = ?")
                    .setParameter(1, equipeId)
                    .setParameter(2, personnelId)
                    .executeUpdate();
                    
            System.out.println("Removed personnel from equipe. Rows affected: " + rowsAffected);
                
            // Refresh the equipe entity to reflect the changes
            entityManager.refresh(equipe);
            
            return equipe;
        } catch (Exception e) {
            throw new RuntimeException("Error removing personnel from equipe: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public Equipe addSoustraiteurToEquipe(String equipeId, String soustraiteurId) {
        Equipe equipe = getEquipeById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found with id: " + equipeId));
                
        Soustraiteure soustraiteur = soustraiteureRepository.findById(soustraiteurId)
                .orElseThrow(() -> new RuntimeException("Soustraiteur not found with id: " + soustraiteurId));
        
        // Get the EntityManager from the repository
        var entityManager = equipeRepository.getEntityManager();
        
        try {
            // Check if soustraiteur exists in the equipe first to avoid duplicates
            try {
                var exists = entityManager.createNativeQuery(
                    "SELECT 1 FROM equipe_has_soustraiteure " +
                    "WHERE equipe_ID_equipe = ? AND soustraiteure_MATRICULE_soustraiteure = ?")
                    .setParameter(1, equipeId)
                    .setParameter(2, soustraiteurId)
                    .getResultList();
                
                if (!exists.isEmpty()) {
                    System.out.println("Soustraiteur already exists in equipe. Skipping insertion.");
                    return equipe;
                }
            } catch (Exception e) {
                System.out.println("Error checking if soustraiteur exists in equipe: " + e.getMessage());
                // Continue with insertion attempt
            }
            
            // Try with extracted numeric ID
            try {
                // Extract numeric part if possible, or use a default
                int numericId = 0;
                try {
                    // Try to extract numeric part from soustraiteurId if it's in format like "ST-001"
                    String[] parts = soustraiteurId.split("-");
                    if (parts.length > 1) {
                        numericId = Integer.parseInt(parts[parts.length-1]);
                    }
                } catch (Exception ex) {
                    // If extraction fails, use a random number
                    numericId = (int)(Math.random() * 10000);
                }
                
                String sql = "INSERT INTO equipe_has_soustraiteure (equipe_ID_equipe, soustraiteure_MATRICULE_soustraiteure, soustraiteure_ID_soustraiteure) VALUES (?, ?, ?)";
                entityManager.createNativeQuery(sql)
                    .setParameter(1, equipeId)
                    .setParameter(2, soustraiteurId)
                    .setParameter(3, numericId)
                    .executeUpdate();
                
                System.out.println("Successfully added soustraiteur to equipe using numeric ID: " + numericId);
            } catch (Exception e) {
                System.out.println("Error with integer ID insert for soustraiteur: " + e.getMessage());
                
                // Try direct SQL as fallback
                try {
                    String directSql = "INSERT INTO equipe_has_soustraiteure (equipe_ID_equipe, soustraiteure_MATRICULE_soustraiteure, soustraiteure_ID_soustraiteure) " +
                                       "VALUES ('" + equipeId + "', '" + soustraiteurId + "', 1)";
                    entityManager.createNativeQuery(directSql).executeUpdate();
                    System.out.println("Successfully added soustraiteur to equipe using direct SQL with hardcoded ID");
                } catch (Exception e2) {
                    // Final fallback - try without ID_soustraiteure if it's not required
                    try {
                        String simpleSql = "INSERT INTO equipe_has_soustraiteure (equipe_ID_equipe, soustraiteure_MATRICULE_soustraiteure) VALUES (?, ?)";
                        entityManager.createNativeQuery(simpleSql)
                            .setParameter(1, equipeId)
                            .setParameter(2, soustraiteurId)
                            .executeUpdate();
                        System.out.println("Successfully added soustraiteur to equipe with simplified query");
                    } catch (Exception e3) {
                        throw new RuntimeException("Failed to add soustraiteur to equipe: " + e3.getMessage(), e3);
                    }
                }
            }
            
            // Refresh the equipe entity to reflect the changes
            entityManager.refresh(equipe);
            
            return equipe;
        } catch (Exception e) {
            throw new RuntimeException("Error adding soustraiteur to equipe: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public Equipe removeSoustraiteurFromEquipe(String equipeId, String soustraiteurId) {
        Equipe equipe = getEquipeById(equipeId)
                .orElseThrow(() -> new RuntimeException("Equipe not found with id: " + equipeId));
                
        // We don't need to check if soustraiteur exists, just attempt to remove
        try {
            // Get the EntityManager from the repository
            var entityManager = equipeRepository.getEntityManager();
            
            // Delete query - will work even if no rows match (will just affect 0 rows)
            int rowsAffected = entityManager.createNativeQuery(
                    "DELETE FROM equipe_has_soustraiteure WHERE equipe_ID_equipe = ? AND soustraiteure_MATRICULE_soustraiteure = ?")
                    .setParameter(1, equipeId)
                    .setParameter(2, soustraiteurId)
                    .executeUpdate();
                    
            System.out.println("Removed soustraiteur from equipe. Rows affected: " + rowsAffected);
                
            // Refresh the equipe entity to reflect the changes
            entityManager.refresh(equipe);
            
            return equipe;
        } catch (Exception e) {
            throw new RuntimeException("Error removing soustraiteur from equipe: " + e.getMessage(), e);
        }
    }
}