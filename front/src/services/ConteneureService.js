import axiosInstance from "./AxiosConfig";

const ENDPOINT = "conteneurs";

class ConteneureService {
  getAllConteneures() {
    return axiosInstance.get(ENDPOINT);
  }

  getConteneureById(id) {
    // If id contains commas, it's a multiple request
    if (typeof id === "string" && id.includes(",")) {
      return axiosInstance.get(`${ENDPOINT}/multiple/${id}`);
    }
    return axiosInstance.get(`${ENDPOINT}/${id}`);
  }
  async createConteneure(containerData) {
    try {
      // Get authentication details
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");

      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      // Ensure idNavire is a string if present
      if (
        containerData.idNavire !== undefined &&
        containerData.idNavire !== null
      ) {
        containerData.idNavire = String(containerData.idNavire);
      }

      // Ensure required fields are present for the backend
      const dataToSend = {
        ...containerData,
        // Removed location field as it's determined by id_type
      };

      // Create headers with token
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Use fetch for direct control over the request
      const response = await fetch(
        `${axiosInstance.defaults.baseURL}/${ENDPOINT}`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(dataToSend),
          credentials: "include",
        }
      );

      // Handle response status
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            `Access forbidden. Your role (${userRole}) may not have permission to create containers. Only administrators can perform this action.`
          );
        }

        // Try to get more detailed error information
        try {
          const errorData = await response.json();
          console.error("Server error details:", errorData);
          throw new Error(
            `Server error: ${errorData.message || response.statusText}`
          );
        } catch (jsonError) {
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}`
          );
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating container:", error);
      throw error;
    }
  }

  updateConteneure(id, data) {
    return axiosInstance.put(`${ENDPOINT}/${id}`, data);
  }

  deleteConteneure(id) {
    return axiosInstance.delete(`${ENDPOINT}/${id}`);
  }

  // Updated methods for container management

  // Assign container to ship
  assignContainerToShip(containerId, shipId) {
    return axiosInstance.put(`${ENDPOINT}/${containerId}/assign/${shipId}`);
  }

  // Unassign container from ship (move to port)
  unassignContainerFromShip(containerId) {
    return axiosInstance.put(`${ENDPOINT}/${containerId}/unassign`);
  }

  // Get all port containers (not assigned to any ship)
  getPortContainers() {
    return axiosInstance.get(`${ENDPOINT}/port`);
  } // Get all ship containers
  getShipContainers(shipId) {
    // Validate shipId before making the API call
    if (
      !shipId ||
      (typeof shipId === "string" && shipId.trim() === "") ||
      (typeof shipId !== "string" && !shipId)
    ) {
      console.warn(
        "getShipContainers: shipId is empty or invalid, rejecting request"
      );
      return Promise.reject(new Error("Ship ID is required"));
    }

    return axiosInstance.get(`${ENDPOINT}/ship/${shipId}`);
  }

  // Test authorization for containers
  testAuthForContainers() {
    return axiosInstance.get(`${ENDPOINT}/auth-test`);
  }

  // Add a method to check admin permissions explicitly
  async checkAdminPermissions() {
    try {
      const response = await this.testAuthForContainers();
      console.log("Auth test result:", response.data);
      return response.data;
    } catch (error) {
      console.error("Permission check failed:", error);
      return {
        hasAdminAuthority: false,
        error: error.message,
      };
    }
  }
}

const conteneureServiceInstance = new ConteneureService();
export default conteneureServiceInstance;
