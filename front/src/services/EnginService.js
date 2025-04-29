import axios from "axios";

const API_URL = "http://localhost:8080/api/engins";

class EnginService {
  getAllEngins() {
    return axios.get(API_URL);
  }

  getEnginById(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  createEngin(data) {
    return axios.post(API_URL, data);
  }

  updateEngin(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  }

  deleteEngin(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
}

const enginServiceInstance = new EnginService();

export default enginServiceInstance;
