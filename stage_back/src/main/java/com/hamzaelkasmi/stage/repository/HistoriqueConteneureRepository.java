package com.hamzaelkasmi.stage.repository;

import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.model.HistoriqueConteneure;
import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.model.OperationConteneure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueConteneureRepository extends JpaRepository<HistoriqueConteneure, Long> {
    
    List<HistoriqueConteneure> findByConteneure(Conteneure conteneure);
    
    List<HistoriqueConteneure> findByNavirePrecedent(Navire navire);
    
    List<HistoriqueConteneure> findByNavireNouveau(Navire navire);
    
    List<HistoriqueConteneure> findByOperationConteneure(OperationConteneure operationConteneure);
} 