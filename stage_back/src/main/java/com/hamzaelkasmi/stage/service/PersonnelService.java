package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Personnel;
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
     * Find personnel by its matricule (now the primary key)
     */
    public Optional<Personnel> getPersonnelById(String matricule) {
        return personnelRepository.findById(matricule);
    }

    /**
     * Find personnel by matricule (same as above since matricule is now the primary
     * key)
     */
    public Optional<Personnel> getPersonnelByMatricule(String matricule) {
        return personnelRepository.findById(matricule);
    }

    public List<Personnel> getPersonnelByEquipeId(String equipeId) {
        return personnelRepository.findByEquipeId(equipeId);
    }

    public Personnel savePersonnel(Personnel personnel) {
        return personnelRepository.save(personnel);
    }

    public void deletePersonnel(String matricule) {
        personnelRepository.deleteById(matricule);
    }

    /**
     * Delete personnel by matricule (same as above since matricule is now the
     * primary key)
     */
    public void deletePersonnelByMatricule(String matricule) {
        personnelRepository.deleteById(matricule);
    }
}