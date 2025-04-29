import axios from 'axios';

const API_URL = 'http://localhost:8080/api/personnel';

class PersonnelService {
  getAllPersonnel() {
    return axios.get(API_URL);
  }

  getPersonnelById(matricule) {
    return axios.get(`${API_URL}/${matricule}`);
  }

  createPersonnel(data) {
    return axios.post(API_URL, data);
  }

  updatePersonnel(matricule, data) {
    return axios.put(`${API_URL}/${matricule}`, data);
  }

  deletePersonnel(matricule) {
    return axios.delete(`${API_URL}/${matricule}`);
  }
}

const personnelServiceInstance = new PersonnelService();

export default personnelServiceInstance;
