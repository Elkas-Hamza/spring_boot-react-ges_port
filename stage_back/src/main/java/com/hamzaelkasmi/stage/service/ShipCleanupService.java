package com.hamzaelkasmi.stage.service;

import com.hamzaelkasmi.stage.model.Escale;
import com.hamzaelkasmi.stage.model.Navire;
import com.hamzaelkasmi.stage.model.Conteneure;
import com.hamzaelkasmi.stage.repository.EscaleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.HashSet;
import java.util.Set;

/**
 * Service for automatically cleaning up ships that have passed their departure
 * date
 */
@Service
public class ShipCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(ShipCleanupService.class);

    @Autowired
    private EscaleRepository escaleRepository;

    @Autowired
    private NavireService navireService;

    @Autowired
    private ConteneureService conteneureService;

    @Autowired
    private EscaleService escaleService;

    /**
     * Scheduled task that runs every 30 minutes to check for ships that should be
     * deleted
     * Ships are deleted when their departure date (DATE_sortie) has passed
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    @Transactional
    public void cleanupExpiredShips() {
        try {
            logger.info("Starting scheduled cleanup of expired ships at {}", LocalDateTime.now());

            // Find all escales where departure date has passed
            List<Escale> expiredEscales = escaleRepository.findExpiredEscales();

            if (expiredEscales.isEmpty()) {
                logger.debug("No expired escales found");
                return;
            }

            logger.info("Found {} expired escales to process", expiredEscales.size());

            // Get unique ship matricules from expired escales
            Set<String> expiredShipMatricules = new HashSet<>();
            for (Escale escale : expiredEscales) {
                expiredShipMatricules.add(escale.getMATRICULE_navire());
            }

            int deletedShipsCount = 0;
            int reassignedContainersCount = 0;

            // Process each expired ship
            for (String matricule : expiredShipMatricules) {
                try {
                    Optional<Navire> navireOpt = navireService.getNavireByMatricule(matricule);

                    if (!navireOpt.isPresent()) {
                        logger.warn("Ship with matricule {} not found in database", matricule);
                        continue;
                    }

                    Navire navire = navireOpt.get();
                    logger.info("Processing expired ship: {} (ID: {}, Matricule: {})",
                            navire.getNomNavire(), navire.getIdNavire(), matricule);

                    // 1. First, reassign all containers from this ship back to the port
                    List<Conteneure> shipContainers = conteneureService.getShipConteneures(navire);

                    for (Conteneure container : shipContainers) {
                        logger.debug("Reassigning container {} from ship {} back to port",
                                container.getId_conteneure(), navire.getNomNavire());

                        conteneureService.unassignConteneureFromShip(container.getId_conteneure());
                        reassignedContainersCount++;
                    }

                    // 2. Delete all escales associated with this ship
                    List<Escale> shipEscales = escaleRepository.findByMatriculeNavire(matricule);
                    for (Escale escale : shipEscales) {
                        logger.debug("Deleting escale {} for expired ship {}",
                                escale.getNum_escale(), navire.getNomNavire());
                        escaleService.deleteEscale(escale.getNum_escale());
                    }

                    // 3. Finally, delete the ship itself
                    logger.info("Deleting expired ship: {} (ID: {})",
                            navire.getNomNavire(), navire.getIdNavire());
                    navireService.deleteNavire(navire.getIdNavire());
                    deletedShipsCount++;

                } catch (Exception e) {
                    logger.error("Error processing expired ship with matricule {}: {}",
                            matricule, e.getMessage(), e);
                    // Continue with other ships even if one fails
                }
            }

            logger.info("Cleanup completed successfully. Deleted {} ships and reassigned {} containers",
                    deletedShipsCount, reassignedContainersCount);

        } catch (Exception e) {
            logger.error("Error during scheduled ship cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Manual cleanup method that can be called directly for testing or immediate
     * cleanup
     * 
     * @return CleanupResult containing statistics about the cleanup operation
     */
    @Transactional
    public CleanupResult performManualCleanup() {
        logger.info("Starting manual cleanup of expired ships");

        List<Escale> expiredEscales = escaleRepository.findExpiredEscales();
        Set<String> expiredShipMatricules = new HashSet<>();

        for (Escale escale : expiredEscales) {
            expiredShipMatricules.add(escale.getMATRICULE_navire());
        }

        int deletedShips = 0;
        int reassignedContainers = 0;
        int deletedEscales = 0;

        for (String matricule : expiredShipMatricules) {
            try {
                Optional<Navire> navireOpt = navireService.getNavireByMatricule(matricule);

                if (navireOpt.isPresent()) {
                    Navire navire = navireOpt.get();

                    // Reassign containers
                    List<Conteneure> containers = conteneureService.getShipConteneures(navire);
                    for (Conteneure container : containers) {
                        conteneureService.unassignConteneureFromShip(container.getId_conteneure());
                        reassignedContainers++;
                    }

                    // Delete escales
                    List<Escale> shipEscales = escaleRepository.findByMatriculeNavire(matricule);
                    for (Escale escale : shipEscales) {
                        escaleService.deleteEscale(escale.getNum_escale());
                        deletedEscales++;
                    }

                    // Delete ship
                    navireService.deleteNavire(navire.getIdNavire());
                    deletedShips++;
                }
            } catch (Exception e) {
                logger.error("Error in manual cleanup for ship {}: {}", matricule, e.getMessage());
            }
        }

        return new CleanupResult(deletedShips, reassignedContainers, deletedEscales, expiredEscales.size());
    }

    /**
     * Get information about ships that are eligible for cleanup (have passed
     * departure date)
     * 
     * @return List of expired escales
     */
    public List<Escale> getExpiredEscales() {
        return escaleRepository.findExpiredEscales();
    }

    /**
     * Result class for cleanup operations
     */
    public static class CleanupResult {
        private final int deletedShips;
        private final int reassignedContainers;
        private final int deletedEscales;
        private final int totalExpiredEscales;

        public CleanupResult(int deletedShips, int reassignedContainers, int deletedEscales, int totalExpiredEscales) {
            this.deletedShips = deletedShips;
            this.reassignedContainers = reassignedContainers;
            this.deletedEscales = deletedEscales;
            this.totalExpiredEscales = totalExpiredEscales;
        }

        public int getDeletedShips() {
            return deletedShips;
        }

        public int getReassignedContainers() {
            return reassignedContainers;
        }

        public int getDeletedEscales() {
            return deletedEscales;
        }

        public int getTotalExpiredEscales() {
            return totalExpiredEscales;
        }

        @Override
        public String toString() {
            return String.format(
                    "CleanupResult{deletedShips=%d, reassignedContainers=%d, deletedEscales=%d, totalExpiredEscales=%d}",
                    deletedShips, reassignedContainers, deletedEscales, totalExpiredEscales);
        }
    }
}
