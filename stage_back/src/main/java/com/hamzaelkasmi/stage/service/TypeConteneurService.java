package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.TypeConteneur;
import com.hamzaelkasmi.stage.repository.TypeConteneurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TypeConteneurService {
    
    @Autowired
    private TypeConteneurRepository typeConteneurRepository;
    
    public List<TypeConteneur> getAllTypes() {
        return typeConteneurRepository.findAll();
    }
    
    public Optional<TypeConteneur> getTypeById(Integer id) {
        return typeConteneurRepository.findById(id);
    }
    
    public Optional<TypeConteneur> getTypeByNom(String nom) {
        return typeConteneurRepository.findByNomType(nom);
    }
    
    public TypeConteneur saveType(TypeConteneur typeConteneur) {
        return typeConteneurRepository.save(typeConteneur);
    }
    
    public void deleteType(Integer id) {
        typeConteneurRepository.deleteById(id);
    }
    
    public boolean existsByNom(String nom) {
        return typeConteneurRepository.existsByNomType(nom);
    }
    
    // Helper method to get a type by name or default to TERRE if not found
    public TypeConteneur getTypeByNomOrDefault(String nomType) {
        return typeConteneurRepository.findByNomType(nomType)
            .orElseGet(() -> typeConteneurRepository.findByNomType("TERRE").orElse(null));
    }
    
    // Helper method to ensure the default container types exist
    public void ensureDefaultTypesExist() {
        if (!existsByNom("NAVIRE")) {
            TypeConteneur navireType = new TypeConteneur(null, "NAVIRE", "Conteneur à bord du navire");
            saveType(navireType);
        }
        
        if (!existsByNom("TERRE")) {
            TypeConteneur terreType = new TypeConteneur(null, "TERRE", "Conteneur sur terre");
            saveType(terreType);
        }
    }
} 