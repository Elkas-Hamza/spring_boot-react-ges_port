import axios from 'axios';

const API_URL = 'http://localhost:8080/api/personnel';

class PersonnelService {
  getAllPersonnel() {
    return axios.get(API_URL);
  }

  getPersonnelById(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  createPersonnel(data) {
    return axios.post(API_URL, data);
  }

  updatePersonnel(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  }

  deletePersonnel(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
}

const personnelServiceInstance = new PersonnelService();

export default personnelServiceInstance;
