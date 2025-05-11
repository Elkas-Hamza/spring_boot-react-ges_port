package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.service.NavireService;
import com.hamzaelkasmi.stage.service.ConteneureService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/navires")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class NavireController {

    private static final Logger logger = LoggerFactory.getLogger(NavireController.class);

    @Autowired
    private NavireService navireService;

    @Autowired
    private ConteneureService conteneureService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Navire>> getAllNavires() {
        logger.info("GET /api/navires - Fetching all navires");
        List<Navire> navires = navireService.getAllNaviresWithContainers();
        logger.info("Found {} navires in database", navires.size());
        
        // Log each navire for debugging
        for (int i = 0; i < navires.size(); i++) {
            Navire navire = navires.get(i);
            logger.info("Navire {}: ID={}, Nom={}, Matricule={}, Conteneurs={}",
                i + 1,
                navire.getIdNavire(),
                navire.getNomNavire(),
                navire.getMatriculeNavire(),
                navire.getConteneurs() != null ? navire.getConteneurs().size() : 0);
        }
        
        // The @JsonManagedReference/@JsonBackReference annotations should handle 
        // the circular references, so we can return the list directly
        return new ResponseEntity<>(navires, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Navire> getNavireById(@PathVariable("id") String id) {
        Optional<Navire> navireData = navireService.getNavireById(id);
        return navireData.map(navire -> new ResponseEntity<>(navire, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/matricule/{matricule}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Navire> getNavireByMatricule(@PathVariable("matricule") String matricule) {
        Optional<Navire> navireData = navireService.getNavireByMatricule(matricule);
        return navireData.map(navire -> new ResponseEntity<>(navire, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/nom/{nom}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Navire> getNavireByNom(@PathVariable("nom") String nom) {
        Optional<Navire> navireData = navireService.getNavireByNom(nom);
        return navireData.map(navire -> new ResponseEntity<>(navire, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Navire> createNavire(@RequestBody Navire navire) {
        try {
            logger.info("Creating new navire: {}", navire);
            
            if (navireService.existsByMatricule(navire.getMatriculeNavire())) {
                logger.warn("Navire with matricule {} already exists", navire.getMatriculeNavire());
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            
            // Ensure idNavire is null so the ID generator will be used
            navire.setIdNavire(null);
            
            Navire _navire = navireService.saveNavire(navire);
            logger.info("Created navire with ID: {}", _navire.getIdNavire());
            return new ResponseEntity<>(_navire, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating navire: {}", e.getMessage(), e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Navire> updateNavire(@PathVariable("id") String id, @RequestBody Navire navire) {
        try {
            logger.info("Updating navire with ID: {}", id);
            Optional<Navire> navireData = navireService.getNavireById(id);
            
            if (navireData.isPresent()) {
                Navire _navire = navireData.get();
                _navire.setNomNavire(navire.getNomNavire());
                _navire.setMatriculeNavire(navire.getMatriculeNavire());
                
                Navire updatedNavire = navireService.saveNavire(_navire);
                logger.info("Updated navire: {}", updatedNavire);
                return new ResponseEntity<>(updatedNavire, HttpStatus.OK);
            } else {
                logger.warn("Navire with ID {} not found", id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error updating navire: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<HttpStatus> deleteNavire(@PathVariable("id") String id) {
        try {
            logger.info("Deleting navire with ID: {}", id);
            navireService.deleteNavire(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting navire: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/debug")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> debugNavires() {
        logger.info("GET /api/navires/debug - Debugging navires fetching");
        List<Navire> navires = navireService.getAllNavires();
        
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("count", navires.size());
        debugInfo.put("isEmpty", navires.isEmpty());
        debugInfo.put("className", navires.getClass().getName());
        
        List<Map<String, Object>> navireDetails = new ArrayList<>();
        for (Navire navire : navires) {
            Map<String, Object> details = new HashMap<>();
            details.put("id", navire.getIdNavire());
            details.put("nom", navire.getNomNavire());
            details.put("matricule", navire.getMatriculeNavire());
            details.put("hasContainers", navire.getConteneurs() != null);
            details.put("containerCount", navire.getConteneurs() != null ? navire.getConteneurs().size() : 0);
            navireDetails.add(details);
        }
        debugInfo.put("navires", navireDetails);
        
        return new ResponseEntity<>(debugInfo, HttpStatus.OK);
    }

    // Add a simplified endpoint for just basic ship info if needed
    @GetMapping("/basic")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Map<String, Object>>> getBasicNavireInfo() {
        logger.info("GET /api/navires/basic - Fetching basic navire info");
        List<Navire> navires = navireService.getAllNaviresWithContainers();
        
        List<Map<String, Object>> simplifiedNavires = new ArrayList<>();
        for (Navire navire : navires) {
            Map<String, Object> navireInfo = new HashMap<>();
            navireInfo.put("idNavire", navire.getIdNavire());
            navireInfo.put("nomNavire", navire.getNomNavire());
            navireInfo.put("matriculeNavire", navire.getMatriculeNavire());
            
            // Get accurate container count
            int containerCount = 0;
            if (navire.getConteneurs() != null) {
                containerCount = navire.getConteneurs().size();
                logger.info("Navire {} has {} containers", navire.getIdNavire(), containerCount);
            }
            navireInfo.put("containerCount", containerCount);
            
            simplifiedNavires.add(navireInfo);
        }
        
        return new ResponseEntity<>(simplifiedNavires, HttpStatus.OK);
    }

    @GetMapping("/withCounts")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Map<String, Object>>> getNaviresWithCounts() {
        logger.info("GET /api/navires/withCounts - Fetching navires with accurate container counts");
        List<Navire> navires = navireService.getAllNavires();
        
        // Get accurate counts using custom query
        Map<String, Integer> containerCounts = navireService.getContainerCountsByNavireId();
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Navire navire : navires) {
            Map<String, Object> navireMap = new HashMap<>();
            navireMap.put("idNavire", navire.getIdNavire());
            navireMap.put("nomNavire", navire.getNomNavire());
            navireMap.put("matriculeNavire", navire.getMatriculeNavire());
            
            // Use the accurate count from the query
            Integer count = containerCounts.getOrDefault(navire.getIdNavire(), 0);
            navireMap.put("containerCount", count);
            logger.info("Ship {} has {} containers (from direct count)", navire.getIdNavire(), count);
            
            result.add(navireMap);
        }
        
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getNavireDetails(@PathVariable("id") String id) {
        logger.info("GET /api/navires/{id}/details - Fetching detailed navire info", id);
        
        Optional<Navire> navireOpt = navireService.getNavireById(id);
        if (!navireOpt.isPresent()) {
            logger.warn("Navire with ID {} not found", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        Navire navire = navireOpt.get();
        
        // Create a response with all necessary details
        Map<String, Object> details = new HashMap<>();
        details.put("idNavire", navire.getIdNavire());
        details.put("nomNavire", navire.getNomNavire());
        details.put("matriculeNavire", navire.getMatriculeNavire());
        
        // Get containers with proper handling of lazy loading
        List<Map<String, Object>> containersList = new ArrayList<>();
        if (navire.getConteneurs() != null) {
            for (Conteneure container : navire.getConteneurs()) {
                Map<String, Object> containerDetails = new HashMap<>();
                containerDetails.put("id_conteneure", container.getId_conteneure());
                containerDetails.put("nom_conteneure", container.getNom_conteneure());
                
                // Add id_type if it exists
                if (container.getId_type() != null) {
                    containerDetails.put("typeId", container.getId_type());
                }
                
                containersList.add(containerDetails);
            }
        }
        
        details.put("containers", containersList);
        details.put("containerCount", containersList.size());
        
        logger.info("Returning detailed info for navire {} with {} containers", 
            navire.getIdNavire(), containersList.size());
        
        return new ResponseEntity<>(details, HttpStatus.OK);
    }

    @GetMapping("/{id}/containers")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Conteneure>> getNavireContainers(@PathVariable("id") String id) {
        logger.info("GET /api/navires/{id}/containers - Fetching containers for navire {}", id);
        
        Optional<Navire> navireOpt = navireService.getNavireById(id);
        if (!navireOpt.isPresent()) {
            logger.warn("Navire with ID {} not found", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        Navire navire = navireOpt.get();
        List<Conteneure> containers = conteneureService.getShipConteneures(navire);
        
        logger.info("Found {} containers for navire {}", containers.size(), id);
        
        return new ResponseEntity<>(containers, HttpStatus.OK);
    }
}