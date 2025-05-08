package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.model.HistoriqueConteneure;
import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.model.Operation;
import com.hamzaelkasmi.stage.model.TypeConteneur;
import com.hamzaelkasmi.stage.repository.ConteneureRepository;
import com.hamzaelkasmi.stage.repository.HistoriqueConteneureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConteneureService {

    @Autowired
    private ConteneureRepository conteneureRepository;
    
    @Autowired
    private HistoriqueConteneureRepository historiqueConteneureRepository;
    
    @Autowired
    private TypeConteneurService typeConteneurService;

    public List<Conteneure> getAllConteneures() {
        return conteneureRepository.findAll();
    }

    public Optional<Conteneure> getConteneureById(String id) {
        return conteneureRepository.findById(id);
    }

    @Transactional
    public Conteneure saveConteneure(Conteneure conteneure) {
        // If this is a new container (no ID), set the date added
        if (conteneure.getId_conteneure() == null) {
            conteneure.setDateAjout(new Date());
        }
        return conteneureRepository.save(conteneure);
    }

    @Transactional
    public void deleteConteneure(String id) {
        conteneureRepository.deleteById(id);
    }
    
    // Get containers at the port (TERRE)
    public List<Conteneure> getPortConteneures() {
        return conteneureRepository.findAll().stream()
            .filter(c -> c.getType_conteneure() == Conteneure.ConteneureLocationType.TERRE)
            .collect(Collectors.toList());
    }
    
    // Get containers on a specific ship
    public List<Conteneure> getShipConteneures(Navire navire) {
        return conteneureRepository.findAll().stream()
            .filter(c -> c.getType_conteneure() == Conteneure.ConteneureLocationType.NAVIRE 
                && c.getNavire() != null 
                && c.getNavire().getIdNavire().equals(navire.getIdNavire()))
            .collect(Collectors.toList());
    }
    
    // Update container location
    @Transactional
    public Conteneure updateConteneureLocation(
            String conteneureId, 
            Conteneure.ConteneureLocationType newLocationType,
            Navire newNavire,
            Operation operation) {
        
        Optional<Conteneure> conteneureOpt = conteneureRepository.findById(conteneureId);
        if (!conteneureOpt.isPresent()) {
            return null;
        }
        
        Conteneure conteneure = conteneureOpt.get();
        Conteneure.ConteneureLocationType oldLocationType = conteneure.getType_conteneure();
        Navire oldNavire = conteneure.getNavire();
        
        // Update location
        conteneure.setType_conteneure(newLocationType);
        conteneure.setNavire(newNavire);
        
        // Set the operation that caused this change
        if (operation != null) {
            conteneure.setDerniereOperation(operation);
        }
        
        // Update TypeConteneur ID based on new location
        if (conteneure.getTypeConteneur() != null) {
            // Determine the correct type ID based on location
            Integer typeId = (newLocationType == Conteneure.ConteneureLocationType.TERRE) ? 1 : 2;
            
            // If current typeId doesn't match the expected one for this location
            if (conteneure.getTypeConteneur().getIdType() == null || 
                !conteneure.getTypeConteneur().getIdType().equals(typeId)) {
                
                // Try to find type with the appropriate ID
                Optional<TypeConteneur> typeById = typeConteneurService.getTypeById(typeId);
                if (typeById.isPresent()) {
                    TypeConteneur type = typeById.get();
                    // Keep the existing type name
                    if (conteneure.getTypeConteneur().getNomType() != null) {
                        type.setNomType(conteneure.getTypeConteneur().getNomType());
                    }
                    conteneure.setTypeConteneur(typeConteneurService.saveType(type));
                } else {
                    // Create new type with correct ID if it doesn't exist
                    TypeConteneur newType = new TypeConteneur(typeId, 
                        conteneure.getTypeConteneur().getNomType() != null ? 
                            conteneure.getTypeConteneur().getNomType() : 
                            ((newLocationType == Conteneure.ConteneureLocationType.TERRE) ? 
                                "Port Container Type" : "Ship Container Type"),
                        (newLocationType == Conteneure.ConteneureLocationType.TERRE) ? 
                            "Land container type" : "Ship container type");
                    conteneure.setTypeConteneur(typeConteneurService.saveType(newType));
                }
            }
        }
        
        // Save changes
        Conteneure updatedConteneure = conteneureRepository.save(conteneure);
        
        // Record the change in history
        HistoriqueConteneure historique = new HistoriqueConteneure();
        historique.setConteneure(conteneure);
        historique.setLocationPrecedente(oldLocationType);
        historique.setLocationNouvelle(newLocationType);
        historique.setNavirePrecedent(oldNavire);
        historique.setNavireNouveau(newNavire);
        historiqueConteneureRepository.save(historique);
        
        return updatedConteneure;
    }
    
    // Assign container to ship
    @Transactional
    public Conteneure assignConteneureToShip(String conteneureId, Navire navire) {
        Optional<Conteneure> conteneureOpt = conteneureRepository.findById(conteneureId);
        if (!conteneureOpt.isPresent()) {
            return null;
        }
        
        Conteneure conteneure = conteneureOpt.get();
        Conteneure.ConteneureLocationType oldLocationType = conteneure.getType_conteneure();
        Navire oldNavire = conteneure.getNavire();
        
        // Update container location
        conteneure.setType_conteneure(Conteneure.ConteneureLocationType.NAVIRE);
        conteneure.setNavire(navire);
        
        // Update TypeConteneur to ID=2 since it's now on a ship
        if (conteneure.getTypeConteneur() != null) {
            // Try to find type with ID 2
            Optional<TypeConteneur> typeById = typeConteneurService.getTypeById(2);
            if (typeById.isPresent()) {
                TypeConteneur type = typeById.get();
                // Keep the existing type name
                if (conteneure.getTypeConteneur().getNomType() != null) {
                    type.setNomType(conteneure.getTypeConteneur().getNomType());
                }
                conteneure.setTypeConteneur(typeConteneurService.saveType(type));
            } else {
                // Create a new type with ID 2 if it doesn't exist
                TypeConteneur newType = new TypeConteneur(2, 
                    conteneure.getTypeConteneur().getNomType() != null ? 
                        conteneure.getTypeConteneur().getNomType() : "Ship Container Type", 
                    "Ship container type");
                conteneure.setTypeConteneur(typeConteneurService.saveType(newType));
            }
        }
        
        // Save changes
        Conteneure updatedConteneure = conteneureRepository.save(conteneure);
        
        // Record the change in history
        HistoriqueConteneure historique = new HistoriqueConteneure();
        historique.setConteneure(conteneure);
        historique.setLocationPrecedente(oldLocationType);
        historique.setLocationNouvelle(Conteneure.ConteneureLocationType.NAVIRE);
        historique.setNavirePrecedent(oldNavire);
        historique.setNavireNouveau(navire);
        historiqueConteneureRepository.save(historique);
        
        return updatedConteneure;
    }
    
    // Unassign container from ship
    @Transactional
    public Conteneure unassignConteneureFromShip(String conteneureId) {
        Optional<Conteneure> conteneureOpt = conteneureRepository.findById(conteneureId);
        if (!conteneureOpt.isPresent()) {
            return null;
        }
        
        Conteneure conteneure = conteneureOpt.get();
        Conteneure.ConteneureLocationType oldLocationType = conteneure.getType_conteneure();
        Navire oldNavire = conteneure.getNavire();
        
        // Update container location
        conteneure.setType_conteneure(Conteneure.ConteneureLocationType.TERRE);
        conteneure.setNavire(null);
        
        // Update TypeConteneur to ID=1 since it's now back at port
        if (conteneure.getTypeConteneur() != null) {
            // Try to find type with ID 1
            Optional<TypeConteneur> typeById = typeConteneurService.getTypeById(1);
            if (typeById.isPresent()) {
                TypeConteneur type = typeById.get();
                // Keep the existing type name
                if (conteneure.getTypeConteneur().getNomType() != null) {
                    type.setNomType(conteneure.getTypeConteneur().getNomType());
                }
                conteneure.setTypeConteneur(typeConteneurService.saveType(type));
            } else {
                // Create a new type with ID 1 if it doesn't exist
                TypeConteneur newType = new TypeConteneur(1, 
                    conteneure.getTypeConteneur().getNomType() != null ? 
                        conteneure.getTypeConteneur().getNomType() : "Port Container Type", 
                    "Land container type");
                conteneure.setTypeConteneur(typeConteneurService.saveType(newType));
            }
        }
        
        // Save changes
        Conteneure updatedConteneure = conteneureRepository.save(conteneure);
        
        // Record the change in history
        HistoriqueConteneure historique = new HistoriqueConteneure();
        historique.setConteneure(conteneure);
        historique.setLocationPrecedente(oldLocationType);
        historique.setLocationNouvelle(Conteneure.ConteneureLocationType.TERRE);
        historique.setNavirePrecedent(oldNavire);
        historique.setNavireNouveau(null);
        historiqueConteneureRepository.save(historique);
        
        return updatedConteneure;
    }
}