import axios from 'axios';

// Create an axios instance with CORS credentials support
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/soustraiteurs',
  withCredentials: true
});

class SoustraiteureService {
  getAllSoustraiteure() {
    return axiosInstance.get('');
  }

  getSoustraiteureById(matricule) {
    return axiosInstance.get(`/${matricule}`);
  }

  createSoustraiteure(data) {
    return axiosInstance.post('', data);
  }

  updateSoustraiteure(matricule, data) {
    return axiosInstance.put(`/${matricule}`, data);
  }

  deleteSoustraiteure(matricule) {
    return axiosInstance.delete(`/${matricule}`);
  }
}

const soustraiteureServiceInstance = new SoustraiteureService();

export default soustraiteureServiceInstance;