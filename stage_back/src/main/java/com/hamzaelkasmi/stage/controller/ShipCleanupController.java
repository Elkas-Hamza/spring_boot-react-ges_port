package com.hamzaelkasmi.stage.controller;

import com.hamzaelkasmi.stage.model.Escale;
import com.hamzaelkasmi.stage.service.ShipCleanupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for ship cleanup operations
 * Provides endpoints to monitor and control automatic ship deletion
 */
@RestController
@RequestMapping("/api/ship-cleanup")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
public class ShipCleanupController {

    private static final Logger logger = LoggerFactory.getLogger(ShipCleanupController.class);

    @Autowired
    private ShipCleanupService shipCleanupService;

    /**
     * Get information about ships that are eligible for cleanup
     */
    @GetMapping("/expired-escales")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<Escale>> getExpiredEscales() {
        try {
            List<Escale> expiredEscales = shipCleanupService.getExpiredEscales();
            logger.info("Retrieved {} expired escales", expiredEscales.size());
            return new ResponseEntity<>(expiredEscales, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving expired escales: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get cleanup status and statistics
     */
    @GetMapping("/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<Map<String, Object>> getCleanupStatus() {
        try {
            List<Escale> expiredEscales = shipCleanupService.getExpiredEscales();

            Map<String, Object> status = new HashMap<>();
            status.put("timestamp", LocalDateTime.now());
            status.put("expiredEscalesCount", expiredEscales.size());
            status.put("scheduledCleanupEnabled", true);
            status.put("cleanupIntervalMinutes", 30);
            status.put("lastCheck", LocalDateTime.now());

            // Group expired escales by ship matricule to get unique ship count
            long uniqueExpiredShips = expiredEscales.stream()
                    .map(Escale::getMATRICULE_navire)
                    .distinct()
                    .count();

            status.put("expiredShipsCount", uniqueExpiredShips);

            return new ResponseEntity<>(status, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting cleanup status: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Manually trigger cleanup of expired ships
     * This endpoint is restricted to ADMIN role only
     */
    @PostMapping("/cleanup")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerManualCleanup() {
        try {
            logger.info("Manual cleanup triggered by admin user");

            ShipCleanupService.CleanupResult result = shipCleanupService.performManualCleanup();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("timestamp", LocalDateTime.now());
            response.put("deletedShips", result.getDeletedShips());
            response.put("reassignedContainers", result.getReassignedContainers());
            response.put("deletedEscales", result.getDeletedEscales());
            response.put("totalExpiredEscales", result.getTotalExpiredEscales());
            response.put("message", String.format("Cleanup completed: %d ships deleted, %d containers reassigned",
                    result.getDeletedShips(), result.getReassignedContainers()));

            logger.info("Manual cleanup completed: {}", result);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error during manual cleanup: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("error", "Cleanup failed: " + e.getMessage());

            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get cleanup configuration and settings
     */
    @GetMapping("/config")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getCleanupConfig() {
        try {
            Map<String, Object> config = new HashMap<>();
            config.put("enabled", true);
            config.put("intervalMinutes", 30);
            config.put("description", "Automatically deletes ships when their departure date (DATE_sortie) has passed");
            config.put("actions", new String[] {
                    "Reassign containers from ship back to port",
                    "Delete all escales associated with the ship",
                    "Delete the ship record"
            });
            config.put("timezone", "System default");
            config.put("nextScheduledRun", "Every 30 minutes");

            return new ResponseEntity<>(config, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting cleanup config: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
