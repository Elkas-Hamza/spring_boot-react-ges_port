import axiosInstance from "./AxiosConfig";

const ENDPOINT = "/api/ship-cleanup";

/**
 * Service for managing automatic ship cleanup functionality
 */
class ShipCleanupService {
  /**
   * Get list of ships/escales that are eligible for cleanup (have passed departure date)
   */
  getExpiredEscales() {
    return axiosInstance.get(`${ENDPOINT}/expired-escales`);
  }

  /**
   * Get cleanup status and statistics
   */
  getCleanupStatus() {
    return axiosInstance.get(`${ENDPOINT}/status`);
  }

  /**
   * Manually trigger cleanup of expired ships (Admin only)
   */
  triggerManualCleanup() {
    return axiosInstance.post(`${ENDPOINT}/cleanup`);
  }

  /**
   * Get cleanup configuration and settings (Admin only)
   */
  getCleanupConfig() {
    return axiosInstance.get(`${ENDPOINT}/config`);
  }

  /**
   * Check if there are any ships ready for cleanup
   */
  async hasExpiredShips() {
    try {
      const response = await this.getExpiredEscales();
      return response.data && response.data.length > 0;
    } catch (error) {
      console.error("Error checking for expired ships:", error);
      return false;
    }
  }

  /**
   * Get summary statistics for dashboard display
   */
  async getCleanupSummary() {
    try {
      const [statusResponse, expiredResponse] = await Promise.all([
        this.getCleanupStatus(),
        this.getExpiredEscales(),
      ]);

      const status = statusResponse.data;
      const expiredEscales = expiredResponse.data;

      // Group by ship matricule to get unique ships
      const uniqueShips = new Set();
      expiredEscales.forEach((escale) => {
        uniqueShips.add(escale.MATRICULE_navire);
      });

      return {
        expiredShipsCount: uniqueShips.size,
        expiredEscalesCount: expiredEscales.length,
        cleanupEnabled: status.scheduledCleanupEnabled,
        intervalMinutes: status.cleanupIntervalMinutes,
        lastCheck: status.lastCheck,
        expiredShips: Array.from(uniqueShips).map((matricule) => {
          const shipEscales = expiredEscales.filter(
            (e) => e.MATRICULE_navire === matricule
          );
          return {
            matricule,
            nomNavire: shipEscales[0]?.NOM_navire || "Unknown",
            escalesCount: shipEscales.length,
            oldestDepartureDate: shipEscales
              .map((e) => new Date(e.DATE_sortie))
              .sort((a, b) => a - b)[0],
          };
        }),
      };
    } catch (error) {
      console.error("Error getting cleanup summary:", error);
      throw error;
    }
  }

  /**
   * Format departure date for display
   */
  formatDepartureDate(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      } else {
        return "Recently expired";
      }
    } catch (error) {
      return "Invalid date";
    }
  }

  /**
   * Validate cleanup permissions (check if user is admin)
   */
  async canPerformCleanup() {
    try {
      const response = await this.getCleanupConfig();
      return response.status === 200;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        return false; // Not authorized
      }
      throw error; // Other error
    }
  }
}

export default new ShipCleanupService();
