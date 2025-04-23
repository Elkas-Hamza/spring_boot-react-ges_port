package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Personnel;
import com.hamzaelkasmi.stage.repository.PersonnelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PersonnelService {

    @Autowired
    private PersonnelRepository personnelRepository;

    public List<Personnel> getAllPersonnel() {
        return personnelRepository.findAll();
    }

    public Optional<Personnel> getPersonnelById(int id) {
        return personnelRepository.findById(id);
    }

    public Personnel getPersonnelByMatricule(String matricule) {
        return personnelRepository.findByMatriculePersonnel(matricule).orElse(null);
    }

    public Personnel savePersonnel(Personnel personnel) {
        return personnelRepository.save(personnel);
    }

    public void deletePersonnel(int id) {
        personnelRepository.deleteById(id);
    }
}