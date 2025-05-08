package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.model.TypeConteneur;
import com.hamzaelkasmi.stage.service.ConteneureService;
import com.hamzaelkasmi.stage.service.NavireService;
import com.hamzaelkasmi.stage.service.TypeConteneurService;
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
    
    @Autowired
    private TypeConteneurService typeConteneurService;

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
            
            // Set the location type (default to TERRE if not specified)
            Conteneure.ConteneureLocationType locationType = Conteneure.ConteneureLocationType.TERRE; // Default
            if (containerData.containsKey("location") && 
                (containerData.get("location").equals("TERRE") || containerData.get("location").equals("NAVIRE"))) {
                locationType = Conteneure.ConteneureLocationType.valueOf((String) containerData.get("location"));
            }
            conteneure.setType_conteneure(locationType);
            
            // Determine the correct type ID based on location:
            // ID=1 for TERRE (land/port)
            // ID=2 for NAVIRE (ship)
            Integer typeId = (locationType == Conteneure.ConteneureLocationType.TERRE) ? 1 : 2;
            
            // Get the container type name from request
            String typeNom = null;
            if (containerData.containsKey("type_conteneur") && containerData.get("type_conteneur") instanceof String) {
                typeNom = (String) containerData.get("type_conteneur");
            } else if (containerData.containsKey("type_conteneure") && containerData.get("type_conteneure") instanceof String) {
                typeNom = (String) containerData.get("type_conteneure");
            }
            
            // If no specific type name was provided, use defaults based on location
            if (typeNom == null || typeNom.isEmpty() || typeNom.equals("TERRE") || typeNom.equals("NAVIRE")) {
                typeNom = (locationType == Conteneure.ConteneureLocationType.TERRE) ? "Standard Port Container" : "Standard Ship Container";
            }
            
            // Instead of trying to update the existing TypeConteneur, let's use it as is
            Optional<TypeConteneur> typeById = typeConteneurService.getTypeById(typeId);
            if (typeById.isPresent()) {
                // Use the existing type with appropriate ID without changing its name
                TypeConteneur type = typeById.get();
                // Store the type name in the container's properties if needed, but don't update the TypeConteneur
                conteneure.setTypeConteneur(type);
            } else {
                // Create a new type with the appropriate ID only if it doesn't exist
                TypeConteneur newType = new TypeConteneur(typeId, 
                    (locationType == Conteneure.ConteneureLocationType.TERRE) ? 
                        "Standard Port Container" : "Standard Ship Container",
                    (locationType == Conteneure.ConteneureLocationType.TERRE) ? 
                        "Land container type" : "Ship container type");
                conteneure.setTypeConteneur(typeConteneurService.saveType(newType));
            }
            
            // Set navire if specified (for containers created directly from the ship detail page)
            if (containerData.containsKey("idNavire") && containerData.get("idNavire") instanceof String) {
                String navireId = (String) containerData.get("idNavire");
                if (!navireId.isEmpty()) {
                    Optional<Navire> navire = navireService.getNavireById(navireId);
                    if (navire.isPresent()) {
                        conteneure.setNavire(navire.get());
                        // Force NAVIRE location type and type ID 2 when a navire is specified
                        conteneure.setType_conteneure(Conteneure.ConteneureLocationType.NAVIRE);
                        
                        // Update typeConteneur to ID 2 since this is on a ship
                        Optional<TypeConteneur> shipTypeById = typeConteneurService.getTypeById(2);
                        if (shipTypeById.isPresent()) {
                            // Use the existing ship type without changing its name
                            conteneure.setTypeConteneur(shipTypeById.get());
                        } else {
                            // Create a new ship type only if it doesn't exist
                            TypeConteneur newShipType = new TypeConteneur(2, "Standard Ship Container", "Ship container type");
                            conteneure.setTypeConteneur(typeConteneurService.saveType(newShipType));
                        }
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
            
            // Update container location type if provided
            Conteneure.ConteneureLocationType locationType = _conteneure.getType_conteneure(); // Default to current value
            if (containerData.containsKey("location") && 
                (containerData.get("location").equals("TERRE") || containerData.get("location").equals("NAVIRE"))) {
                locationType = Conteneure.ConteneureLocationType.valueOf((String) containerData.get("location"));
                _conteneure.setType_conteneure(locationType);
            }
            
            // Determine the correct type ID based on location:
            // ID=1 for TERRE (land/port)
            // ID=2 for NAVIRE (ship)
            Integer typeId = (locationType == Conteneure.ConteneureLocationType.TERRE) ? 1 : 2;
            
            // Get the container type name from request
            String typeNom = null;
            if (containerData.containsKey("type_conteneur") && containerData.get("type_conteneur") instanceof String) {
                typeNom = (String) containerData.get("type_conteneur");
            } else if (containerData.containsKey("type_conteneure") && containerData.get("type_conteneure") instanceof String) {
                typeNom = (String) containerData.get("type_conteneure");
            }
            
            // If valid type name was provided, update the container type - but don't modify TypeConteneur
            if (typeNom != null && !typeNom.isEmpty() && !typeNom.equals("TERRE") && !typeNom.equals("NAVIRE")) {
                // Simply use the existing type with appropriate ID based on location
                Optional<TypeConteneur> typeById = typeConteneurService.getTypeById(typeId);
                if (typeById.isPresent()) {
                    // Use existing type without modifying its name
                    _conteneure.setTypeConteneur(typeById.get());
                } else {
                    // Create new type with appropriate ID only if it doesn't exist
                    TypeConteneur newType = new TypeConteneur(typeId, 
                        (locationType == Conteneure.ConteneureLocationType.TERRE) ? 
                            "Standard Port Container" : "Standard Ship Container",
                        (locationType == Conteneure.ConteneureLocationType.TERRE) ? 
                            "Land container type" : "Ship container type");
                    _conteneure.setTypeConteneur(typeConteneurService.saveType(newType));
                }
            }
            
            // Handle navire association - if present in the update
            if (containerData.containsKey("idNavire")) {
                String navireId = containerData.get("idNavire").toString();
                if (navireId != null && !navireId.isEmpty()) {
                    Optional<Navire> navire = navireService.getNavireById(navireId);
                    if (navire.isPresent()) {
                        _conteneure.setNavire(navire.get());
                        // Force NAVIRE location type and type ID 2 when a navire is specified
                        _conteneure.setType_conteneure(Conteneure.ConteneureLocationType.NAVIRE);
                        
                        // Ensure the type ID is 2 (ship type) when associated with a ship
                        if (_conteneure.getTypeConteneur() != null && 
                            _conteneure.getTypeConteneur().getIdType() != 2) {
                            // Need to update type to ID 2, but don't modify the existing type
                            Optional<TypeConteneur> shipType = typeConteneurService.getTypeById(2);
                            if (shipType.isPresent()) {
                                // Use the existing ship type without modifying it
                                _conteneure.setTypeConteneur(shipType.get());
                            }
                        }
                    }
                } else {
                    // If navireId is empty or null, remove association
                    _conteneure.setNavire(null);
                    // Change to TERRE when no ship is associated
                    _conteneure.setType_conteneure(Conteneure.ConteneureLocationType.TERRE);
                    
                    // Update type to ID 1 (land type) when unassociated from ship
                    Optional<TypeConteneur> landType = typeConteneurService.getTypeById(1);
                    if (landType.isPresent()) {
                        // Use existing land type without modifying it
                        _conteneure.setTypeConteneur(landType.get());
                    }
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
            
            if ("TERRE".equals(locationType.toUpperCase())) {
                containers = conteneureService.getPortConteneures();
            } else if ("NAVIRE".equals(locationType.toUpperCase())) {
                containers = conteneureService.getAllConteneures().stream()
                    .filter(c -> c.getType_conteneure() == Conteneure.ConteneureLocationType.NAVIRE)
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