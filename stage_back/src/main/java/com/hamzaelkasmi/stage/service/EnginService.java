package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Engin;
import com.hamzaelkasmi.stage.repository.EnginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EnginService {

    @Autowired
    private EnginRepository enginRepository;

    public List<Engin> getAllEngins() {
        return enginRepository.findAll();
    }

    public Optional<Engin> getEnginById(String id) {
        return enginRepository.findById(id);
    }

    public Engin saveEngin(Engin engin) {
        return enginRepository.save(engin);
    }

    public void deleteEngin(String id) {
        enginRepository.deleteById(id);
    }
} 