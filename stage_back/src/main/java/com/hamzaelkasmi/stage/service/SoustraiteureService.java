package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Soustraiteure;
import com.hamzaelkasmi.stage.repository.SoustraiteureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SoustraiteureService {

    @Autowired
    private SoustraiteureRepository soustraiteureRepository;

    public List<Soustraiteure> getAllSoustraiteure() {
        return soustraiteureRepository.findAll();
    }

    public Optional<Soustraiteure> getSoustraiteureById(int id) {
        return soustraiteureRepository.findById(id);
    }

    public Soustraiteure getSoustraiteureByMatricule(String matricule) {
        return soustraiteureRepository.findByMatriculeSoustraiteure(matricule).orElse(null);
    }

    public Soustraiteure saveSoustraiteure(Soustraiteure soustraiteure) {
        return soustraiteureRepository.save(soustraiteure);
    }

    public void deleteSoustraiteure(int id) {
        soustraiteureRepository.deleteById(id);
    }
}