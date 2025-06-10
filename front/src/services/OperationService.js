import axiosInstance from "./AxiosConfig";

const ENDPOINT = "/operations";

class OperationService {
  getAllOperations() {
    return axiosInstance.get(ENDPOINT);
  }
  getAllOperationsWithDetails() {
    console.log("Fetching operations with details...");
    return axiosInstance
      .get(`${ENDPOINT}/with-details`)
      .then((response) => {
        console.log("Operations API response:", response);
        return response;
      })
      .catch((error) => {
        console.error("Error fetching operations:", error);
        throw error;
      });
  }

  getOperationById(id) {
    return axiosInstance.get(`${ENDPOINT}/${id}`);
  }

  getOperationWithDetailsById(id) {
    return axiosInstance.get(`${ENDPOINT}/${id}/with-details`);
  }
  getOperationsByEscaleId(escaleId) {
    return axiosInstance.get(`${ENDPOINT}/escale/${escaleId}`);
  }

  getOperationsByEscaleIdAndStatus(escaleId, status) {
    return axiosInstance.get(`${ENDPOINT}/escale/${escaleId}/status/${status}`);
  }

  getOperationsByShiftId(shiftId) {
    return axiosInstance.get(`${ENDPOINT}/shift/${shiftId}`);
  }

  getOperationsByEquipeId(equipeId) {
    return axiosInstance.get(`${ENDPOINT}/equipe/${equipeId}`);
  }

  createOperation(data) {
    return axiosInstance.post(ENDPOINT, data);
  }

  updateOperation(id, data) {
    return axiosInstance.put(`${ENDPOINT}/${id}`, data);
  }

  deleteOperation(id) {
    return axiosInstance.delete(`${ENDPOINT}/${id}`);
  }
}

const operationServiceInstance = new OperationService();

export default operationServiceInstance;
