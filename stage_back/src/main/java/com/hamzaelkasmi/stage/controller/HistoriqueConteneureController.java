package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.model.HistoriqueConteneure;
import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.model.OperationConteneure;
import com.hamzaelkasmi.stage.service.ConteneureService;
import com.hamzaelkasmi.stage.service.HistoriqueConteneureService;
import com.hamzaelkasmi.stage.service.NavireService;
import com.hamzaelkasmi.stage.service.OperationConteneureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/historique-conteneurs")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class HistoriqueConteneureController {

    @Autowired
    private HistoriqueConteneureService historiqueConteneureService;
    
    @Autowired
    private ConteneureService conteneureService;
    
    @Autowired
    private NavireService navireService;
    
    @Autowired
    private OperationConteneureService operationConteneureService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<HistoriqueConteneure>> getAllHistoriques() {
        List<HistoriqueConteneure> historiques = historiqueConteneureService.getAllHistoriques();
        return new ResponseEntity<>(historiques, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<HistoriqueConteneure> getHistoriqueById(@PathVariable("id") Long id) {
        Optional<HistoriqueConteneure> historique = historiqueConteneureService.getHistoriqueById(id);
        return historique.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/container/{containerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<HistoriqueConteneure>> getHistoriquesByContainerId(@PathVariable("containerId") String containerId) {
        Optional<Conteneure> conteneureOpt = conteneureService.getConteneureById(containerId);
        if (!conteneureOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<HistoriqueConteneure> historiques = historiqueConteneureService.getHistoriquesByConteneur(conteneureOpt.get());
        return new ResponseEntity<>(historiques, HttpStatus.OK);
    }
    
    @GetMapping("/navire-ancien/{navireId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<HistoriqueConteneure>> getHistoriquesByAncienNavire(@PathVariable("navireId") String navireId) {
        Optional<Navire> navireOpt = navireService.getNavireById(navireId);
        if (!navireOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<HistoriqueConteneure> historiques = historiqueConteneureService.getHistoriquesByNavirePrecedent(navireOpt.get());
        return new ResponseEntity<>(historiques, HttpStatus.OK);
    }
    
    @GetMapping("/navire-nouveau/{navireId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<HistoriqueConteneure>> getHistoriquesByNouveauNavire(@PathVariable("navireId") String navireId) {
        Optional<Navire> navireOpt = navireService.getNavireById(navireId);
        if (!navireOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<HistoriqueConteneure> historiques = historiqueConteneureService.getHistoriquesByNavireNouveau(navireOpt.get());
        return new ResponseEntity<>(historiques, HttpStatus.OK);
    }
    
    @GetMapping("/operation/{operationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<HistoriqueConteneure>> getHistoriquesByOperation(@PathVariable("operationId") String operationId) {
        Optional<OperationConteneure> operationOpt = operationConteneureService.getOperationConteneureById(operationId);
        if (!operationOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        List<HistoriqueConteneure> historiques = historiqueConteneureService.getHistoriquesByOperationConteneure(operationOpt.get());
        return new ResponseEntity<>(historiques, HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteHistorique(@PathVariable("id") Long id) {
        try {
            historiqueConteneureService.deleteHistorique(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 