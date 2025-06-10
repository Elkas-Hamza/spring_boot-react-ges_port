import React, { useState, useEffect } from "react";
import ShipCleanupService from "../../services/ShipCleanupService";
import "./ShipCleanup.css";

const ShipCleanup = () => {
  const [cleanupStatus, setCleanupStatus] = useState(null);
  const [expiredEscales, setExpiredEscales] = useState([]);
  const [cleanupSummary, setCleanupSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cleanupInProgress, setCleanupInProgress] = useState(false);
  const [lastCleanupResult, setLastCleanupResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCleanupData();
    checkAdminPermissions();
  }, []);

  const checkAdminPermissions = async () => {
    try {
      const canCleanup = await ShipCleanupService.canPerformCleanup();
      setIsAdmin(canCleanup);
    } catch (error) {
      console.error("Error checking admin permissions:", error);
      setIsAdmin(false);
    }
  };

  const loadCleanupData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summary, status, expired] = await Promise.all([
        ShipCleanupService.getCleanupSummary(),
        ShipCleanupService.getCleanupStatus(),
        ShipCleanupService.getExpiredEscales(),
      ]);

      setCleanupSummary(summary);
      setCleanupStatus(status.data);
      setExpiredEscales(expired.data);
    } catch (error) {
      console.error("Error loading cleanup data:", error);
      setError("Failed to load cleanup data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCleanup = async () => {
    if (!isAdmin) {
      alert("You need administrator privileges to perform manual cleanup.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete all expired ships and reassign their containers? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setCleanupInProgress(true);
      setError(null);

      const response = await ShipCleanupService.triggerManualCleanup();
      setLastCleanupResult(response.data);

      // Reload data after cleanup
      await loadCleanupData();

      alert(
        `Cleanup completed successfully! ${response.data.deletedShips} ships deleted, ${response.data.reassignedContainers} containers reassigned.`
      );
    } catch (error) {
      console.error("Error during manual cleanup:", error);
      setError("Manual cleanup failed: " + error.message);
      alert("Manual cleanup failed. Please check the console for details.");
    } finally {
      setCleanupInProgress(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="ship-cleanup-container">
        <div className="loading">Loading cleanup data...</div>
      </div>
    );
  }

  return (
    <div className="ship-cleanup-container">
      <div className="ship-cleanup-header">
        <h2>🚢 Ship Cleanup Management</h2>
        <p>Automatic cleanup of ships that have passed their departure date</p>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={loadCleanupData} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* Cleanup Status Overview */}
      <div className="cleanup-status-card">
        <h3>Cleanup Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Scheduled Cleanup:</span>
            <span
              className={`status-value ${
                cleanupStatus?.scheduledCleanupEnabled ? "enabled" : "disabled"
              }`}
            >
              {cleanupStatus?.scheduledCleanupEnabled
                ? "✓ Enabled"
                : "✗ Disabled"}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Cleanup Interval:</span>
            <span className="status-value">
              {cleanupStatus?.cleanupIntervalMinutes || 30} minutes
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Expired Ships:</span>
            <span
              className={`status-value ${
                cleanupSummary?.expiredShipsCount > 0 ? "warning" : "success"
              }`}
            >
              {cleanupSummary?.expiredShipsCount || 0}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Expired Escales:</span>
            <span
              className={`status-value ${
                cleanupSummary?.expiredEscalesCount > 0 ? "warning" : "success"
              }`}
            >
              {cleanupSummary?.expiredEscalesCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Manual Cleanup Section */}
      {isAdmin && (
        <div className="manual-cleanup-card">
          <h3>Manual Cleanup</h3>
          <p>Trigger immediate cleanup of all expired ships</p>
          <button
            onClick={handleManualCleanup}
            disabled={
              cleanupInProgress || cleanupSummary?.expiredShipsCount === 0
            }
            className={`cleanup-button ${
              cleanupInProgress ? "in-progress" : ""
            }`}
          >
            {cleanupInProgress
              ? "Cleaning up..."
              : `Cleanup ${cleanupSummary?.expiredShipsCount || 0} Ships`}
          </button>

          {lastCleanupResult && (
            <div className="cleanup-result">
              <h4>Last Cleanup Result:</h4>
              <p>✓ {lastCleanupResult.deletedShips} ships deleted</p>
              <p>
                ✓ {lastCleanupResult.reassignedContainers} containers reassigned
              </p>
              <p>✓ {lastCleanupResult.deletedEscales} escales deleted</p>
              <p>
                <small>
                  Completed at: {formatDate(lastCleanupResult.timestamp)}
                </small>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expired Ships List */}
      {cleanupSummary?.expiredShips &&
        cleanupSummary.expiredShips.length > 0 && (
          <div className="expired-ships-card">
            <h3>Expired Ships ({cleanupSummary.expiredShips.length})</h3>
            <div className="expired-ships-list">
              {cleanupSummary.expiredShips.map((ship, index) => (
                <div key={ship.matricule} className="expired-ship-item">
                  <div className="ship-info">
                    <h4>{ship.nomNavire}</h4>
                    <p>
                      <strong>Matricule:</strong> {ship.matricule}
                    </p>
                    <p>
                      <strong>Escales:</strong> {ship.escalesCount}
                    </p>
                    <p>
                      <strong>Departure:</strong>{" "}
                      {ShipCleanupService.formatDepartureDate(
                        ship.oldestDepartureDate
                      )}
                    </p>
                  </div>
                  <div className="ship-status">
                    <span className="expired-badge">Expired</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* No Expired Ships Message */}
      {cleanupSummary?.expiredShips &&
        cleanupSummary.expiredShips.length === 0 && (
          <div className="no-expired-ships">
            <div className="success-icon">✓</div>
            <h3>No Expired Ships</h3>
            <p>All ships are within their scheduled timeframes.</p>
          </div>
        )}

      {/* Refresh Button */}
      <div className="actions">
        <button
          onClick={loadCleanupData}
          className="refresh-button"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    </div>
  );
};

export default ShipCleanup;
