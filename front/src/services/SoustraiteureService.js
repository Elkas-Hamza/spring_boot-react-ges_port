import axios from 'axios';

const API_URL = 'http://localhost:8080/api/soustraiteure';

class SoustraiteureService {
  getAllSoustraiteure() {
    return axios.get(API_URL);
  }

  getSoustraiteureById(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  createSoustraiteure(data) {
    return axios.post(API_URL, data);
  }

  updateSoustraiteure(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  }

  deleteSoustraiteure(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
}

const soustraiteureServiceInstance = new SoustraiteureService();

export default soustraiteureServiceInstance;