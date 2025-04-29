package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Arret;
import com.hamzaelkasmi.stage.repository.ArretRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArretService {

    @Autowired
    private ArretRepository arretRepository;

    public List<Arret> getAllArrets() {
        return arretRepository.findAll();
    }

    public Optional<Arret> getArretById(String id) {
        return arretRepository.findById(id);
    }

    public Arret saveArret(Arret arret) {
        return arretRepository.save(arret);
    }

    public void deleteArret(String id) {
        arretRepository.deleteById(id);
    }
}