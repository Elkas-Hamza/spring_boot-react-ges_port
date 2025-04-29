package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.repository.ConteneureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConteneureService {

    @Autowired
    private ConteneureRepository conteneureRepository;

    public List<Conteneure> getAllConteneures() {
        return conteneureRepository.findAll();
    }

    public Optional<Conteneure> getConteneureById(String id) {
        return conteneureRepository.findById(id);
    }

    public Conteneure saveConteneure(Conteneure conteneure) {
        return conteneureRepository.save(conteneure);
    }

    public void deleteConteneure(String id) {
        conteneureRepository.deleteById(id);
    }
} 