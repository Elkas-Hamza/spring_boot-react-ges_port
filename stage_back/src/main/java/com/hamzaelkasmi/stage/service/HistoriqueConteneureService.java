package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.model.HistoriqueConteneure;
import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.model.OperationConteneure;
import com.hamzaelkasmi.stage.repository.HistoriqueConteneureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HistoriqueConteneureService {

    @Autowired
    private HistoriqueConteneureRepository historiqueConteneureRepository;

    public List<HistoriqueConteneure> getAllHistoriques() {
        return historiqueConteneureRepository.findAll();
    }

    public Optional<HistoriqueConteneure> getHistoriqueById(Long id) {
        return historiqueConteneureRepository.findById(id);
    }
    
    public List<HistoriqueConteneure> getHistoriquesByConteneur(Conteneure conteneure) {
        return historiqueConteneureRepository.findByConteneure(conteneure);
    }
    
    public List<HistoriqueConteneure> getHistoriquesByNavirePrecedent(Navire navire) {
        return historiqueConteneureRepository.findByNavirePrecedent(navire);
    }
    
    public List<HistoriqueConteneure> getHistoriquesByNavireNouveau(Navire navire) {
        return historiqueConteneureRepository.findByNavireNouveau(navire);
    }
    
    public List<HistoriqueConteneure> getHistoriquesByOperationConteneure(OperationConteneure operationConteneure) {
        return historiqueConteneureRepository.findByOperationConteneure(operationConteneure);
    }
    
    public HistoriqueConteneure saveHistorique(HistoriqueConteneure historique) {
        return historiqueConteneureRepository.save(historique);
    }
    
    public void deleteHistorique(Long id) {
        historiqueConteneureRepository.deleteById(id);
    }
} 