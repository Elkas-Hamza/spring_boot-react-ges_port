package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Personnel;
import com.hamzaelkasmi.stage.model.PersonnelId;
import com.hamzaelkasmi.stage.repository.PersonnelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PersonnelService {

    @Autowired
    private PersonnelRepository personnelRepository;

    public List<Personnel> getAllPersonnel() {
        return personnelRepository.findAll();
    }

    /**
     * Find personnel by its composite ID
     */
    public Optional<Personnel> getPersonnelById(PersonnelId id) {
        return personnelRepository.findById(id);
    }
    
    /**
     * Find personnel by just the matricule part of the ID
     */
    public Optional<Personnel> getPersonnelByMatricule(String matricule) {
        return personnelRepository.findByMatricule(matricule);
    }

    public List<Personnel> getPersonnelByEquipeId(String equipeId) {
        return personnelRepository.findByEquipeId(equipeId);
    }

    public Personnel savePersonnel(Personnel personnel) {
        return personnelRepository.save(personnel);
    }

    public void deletePersonnel(PersonnelId id) {
        personnelRepository.deleteById(id);
    }
    
    /**
     * Delete personnel by matricule
     */
    public void deletePersonnelByMatricule(String matricule) {
        Optional<Personnel> personnel = personnelRepository.findByMatricule(matricule);
        personnel.ifPresent(p -> personnelRepository.delete(p));
    }
}