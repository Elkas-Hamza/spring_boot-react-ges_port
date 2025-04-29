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

    public Optional<Personnel> getPersonnelById(String matricule) {
        return personnelRepository.findById(matricule);
    }

    public Personnel savePersonnel(Personnel personnel) {
        return personnelRepository.save(personnel);
    }

    public void deletePersonnel(String matricule) {
        personnelRepository.deleteById(matricule);
    }
}