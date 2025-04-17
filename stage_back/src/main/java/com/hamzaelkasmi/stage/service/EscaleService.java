package com.hamzaelkasmi.stage.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.hamzaelkasmi.stage.model.Escale;
import com.hamzaelkasmi.stage.repository.EscaleRepository;

@Service
public class EscaleService {
    
    @Autowired
    private EscaleRepository escaleRepository;
    
    public List<Escale> getAllEscales() {
        return escaleRepository.findAll();
    }
    
    public Optional<Escale> getEscaleById(int id) {
        return escaleRepository.findById(id);
    }
    
    public Escale saveEscale(Escale escale) {
        return escaleRepository.save(escale);
    }
    
    public void deleteEscale(int id) {
        escaleRepository.deleteById(id);
    }
}