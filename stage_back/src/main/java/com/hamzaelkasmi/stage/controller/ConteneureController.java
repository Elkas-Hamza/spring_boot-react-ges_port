package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.service.ConteneureService;
import com.hamzaelkasmi.stage.service.NavireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conteneurs")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class ConteneureController {

    @Autowired
    private ConteneureService conteneureService;
    
    @Autowired
    private NavireService navireService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<Conteneure>> getAllConteneures() {
        List<Conteneure> conteneures = conteneureService.getAllConteneures();
        return new ResponseEntity<>(conteneures, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<Conteneure> getConteneureById(@PathVariable("id") String id) {
        // Check if this is a comma-separated list
        if (id.contains(",")) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        Optional<Conteneure> conteneureData = conteneureService.getConteneureById(id);
        if (conteneureData.isPresent()) {
            return new ResponseEntity<>(conteneureData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/multiple/{ids}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<Conteneure>> getConteneursByIds(@PathVariable("ids") String ids) {
        List<String> idList = Arrays.asList(ids.split(","));
        List<Conteneure> conteneurs = new ArrayList<>();
        
        for (String id : idList) {
            Optional<Conteneure> conteneur = conteneureService.getConteneureById(id.trim());
            conteneur.ifPresent(conteneurs::add);
        }
        
        if (conteneurs.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        return new ResponseEntity<>(conteneurs, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Conteneure> createConteneure(@RequestBody Map<String, Object> containerData) {
        try {
            // Create a new container with the data from the request
            Conteneure conteneure = new Conteneure();

            // Extract the container name
            if (containerData.containsKey("nom_conteneure")) {
                conteneure.setNom_conteneure((String) containerData.get("nom_conteneure"));
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Set container type if provided
            if (containerData.containsKey("type_conteneure")) {
                conteneure.setType_conteneure((String) containerData.get("type_conteneure"));
            }
            
            // Set default ID_type (1 for TERRE containers)
            conteneure.setId_type(1);
            
            // Set ID_type if explicitly provided
            if (containerData.containsKey("id_type") && containerData.get("id_type") instanceof Number) {
                conteneure.setId_type((Integer) containerData.get("id_type"));
            }
            
            // Set navire if specified (for containers created directly from the ship detail page)
            if (containerData.containsKey("idNavire") && containerData.get("idNavire") instanceof String) {
                String navireId = (String) containerData.get("idNavire");
                if (!navireId.isEmpty()) {
                    Optional<Navire> navire = navireService.getNavireById(navireId);
                    if (navire.isPresent()) {
                        conteneure.setNavire(navire.get());
                        // Force type ID 2 when a navire is specified
                        conteneure.setId_type(2);
                    }
                }
            }
            
            // Save the container
            Conteneure _conteneure = conteneureService.saveConteneure(conteneure);
            return new ResponseEntity<>(_conteneure, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Conteneure> updateConteneure(@PathVariable("id") String id, @RequestBody Map<String, Object> containerData) {
        Optional<Conteneure> conteneureData = conteneureService.getConteneureById(id);
        if (conteneureData.isPresent()) {
            Conteneure _conteneure = conteneureData.get();
            
            // Update container name if provided
            if (containerData.containsKey("nom_conteneure")) {
                _conteneure.setNom_conteneure((String) containerData.get("nom_conteneure"));
            }
            
            // Update container type if provided
            if (containerData.containsKey("type_conteneure")) {
                _conteneure.setType_conteneure((String) containerData.get("type_conteneure"));
            }
            
            // Update ID_type if provided
            if (containerData.containsKey("id_type") && containerData.get("id_type") instanceof Number) {
                _conteneure.setId_type((Integer) containerData.get("id_type"));
            }
            
            // Handle navire association - if present in the update
            if (containerData.containsKey("idNavire")) {
                String navireId = containerData.get("idNavire").toString();
                if (navireId != null && !navireId.isEmpty()) {
                    Optional<Navire> navire = navireService.getNavireById(navireId);
                    if (navire.isPresent()) {
                        _conteneure.setNavire(navire.get());
                        // Set ID_type to 2 when a navire is specified
                        _conteneure.setId_type(2);
                    }
                } else {
                    // If navireId is empty or null, remove association
                    _conteneure.setNavire(null);
                    // Set ID_type to 1 when no ship is associated
                    _conteneure.setId_type(1);
                }
            }
            
            return new ResponseEntity<>(conteneureService.saveConteneure(_conteneure), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<HttpStatus> deleteConteneure(@PathVariable("id") String id) {
        try {
            conteneureService.deleteConteneure(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Updated endpoints for container management

    @GetMapping("/port")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<Conteneure>> getPortContainers() {
        try {
            List<Conteneure> portContainers = conteneureService.getPortConteneures();
            return new ResponseEntity<>(portContainers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/ship/{shipId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<Conteneure>> getShipContainers(@PathVariable("shipId") String shipId) {
        try {
            Optional<Navire> navire = navireService.getNavireById(shipId);
            if (!navire.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            List<Conteneure> shipContainers = conteneureService.getShipConteneures(navire.get());
            return new ResponseEntity<>(shipContainers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/{containerId}/assign/{shipId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Conteneure> assignContainerToShip(
            @PathVariable("containerId") String containerId,
            @PathVariable("shipId") String shipId) {
        try {
            Optional<Navire> navireOpt = navireService.getNavireById(shipId);
            
            if (!navireOpt.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            Conteneure updatedContainer = conteneureService.assignConteneureToShip(containerId, navireOpt.get());
            
            if (updatedContainer == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            return new ResponseEntity<>(updatedContainer, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/{containerId}/unassign")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Conteneure> unassignContainerFromShip(
            @PathVariable("containerId") String containerId) {
        try {
            Conteneure updatedContainer = conteneureService.unassignConteneureFromShip(containerId);
            
            if (updatedContainer == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            return new ResponseEntity<>(updatedContainer, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/location/{locationType}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<Conteneure>> getConteneuresByLocationType(
            @PathVariable("locationType") String locationType) {
        try {
            List<Conteneure> containers;
            
            // Use id_type instead of location string
            if ("TERRE".equals(locationType.toUpperCase())) {
                containers = conteneureService.getPortConteneures();
            } else if ("NAVIRE".equals(locationType.toUpperCase())) {
                containers = conteneureService.getAllConteneures().stream()
                    .filter(c -> c.getNavire() != null)
                    .collect(Collectors.toList());
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            return new ResponseEntity<>(containers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/auth-test")
    public ResponseEntity<Map<String, Object>> testAuthForContainers() {
        Map<String, Object> response = new HashMap<>();
        
        // Get authentication info
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        
        response.put("username", username);
        response.put("authenticated", auth.isAuthenticated());
        response.put("authorities", authorities.stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList()));
            
        boolean hasAdminAuthority = authorities.stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        response.put("hasAdminAuthority", hasAdminAuthority);
        
        // Admin users should be able to create containers
        response.put("canCreateContainers", hasAdminAuthority);
        
        return ResponseEntity.ok(response);
    }
}