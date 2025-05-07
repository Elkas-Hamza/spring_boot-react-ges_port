import axiosInstance from "./AxiosConfig";

class ArretService {
  getAllArrets() {
    return axiosInstance.get("/arrets");
  }

  getArretById(id) {
    return axiosInstance.get(`/arrets/${id}`);
  }

  createArret(arret) {
    return axiosInstance.post("/arrets", arret);
  }

  updateArret(id, arret) {
    return axiosInstance.put(`/arrets/${id}`, arret);
  }

  deleteArret(id) {
    return axiosInstance.delete(`/arrets/${id}`);
  }
  
  // Find all arrêts for a specific operation ID
  async getActiveArretsForOperation(operationId) {
    try {
      // Get all arrêts
      const response = await this.getAllArrets();
      
      if (!response.data) {
        return [];
      }
      
      const now = new Date();
      
      // Filter arrêts by operation ID and check if they are active (current date is between start and end date)
      return response.data.filter(arret => {
        // Match the operation ID
        if (arret.id_operation !== operationId && arret.ID_operation !== operationId) {
          return false;
        }
        
        // Check if the arrêt is active (current date is between start and end date)
        const startDate = new Date(arret.DATE_DEBUT_arret || arret.date_DEBUT_arret);
        const endDate = new Date(arret.DATE_FIN_arret || arret.date_FIN_arret);
        
        return startDate <= now && endDate >= now;
      });
    } catch (error) {
      console.error("Error fetching arrêts for operation:", error);
      return [];
    }
  }
}

export default new ArretService();
