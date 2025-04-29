import axios from "axios";

const API_URL = "http://localhost:8080/api/operations";

class OperationService {
  getAllOperations() {
    return axios.get(API_URL);
  }

  getOperationById(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  getOperationsByEscale(escaleId) {
    return axios.get(`${API_URL}/escales/${escaleId}`);
  }

  getOperationsByShiftId(shiftId) {
    return axios.get(`${API_URL}/shift/${shiftId}`);
  }

  getOperationsByEquipeId(equipeId) {
    return axios.get(`${API_URL}/equipe/${equipeId}`);
  }

  createOperation(data) {
    return axios.post(API_URL, data);
  }

  updateOperation(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  }

  deleteOperation(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
}

const operationServiceInstance = new OperationService();

export default operationServiceInstance;
