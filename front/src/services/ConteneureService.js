import axiosInstance from './AxiosConfig';

const ENDPOINT = "/conteneurs";

class ConteneureService {
  getAllConteneures() {
    return axiosInstance.get(ENDPOINT);
  }

  getConteneureById(id) {
    // If id contains commas, it's a multiple request
    if (typeof id === 'string' && id.includes(',')) {
      return axiosInstance.get(`${ENDPOINT}/multiple/${id}`);
    }
    return axiosInstance.get(`${ENDPOINT}/${id}`);
  }

  createConteneure(data) {
    return axiosInstance.post(ENDPOINT, data);
  }

  updateConteneure(id, data) {
    return axiosInstance.put(`${ENDPOINT}/${id}`, data);
  }

  deleteConteneure(id) {
    return axiosInstance.delete(`${ENDPOINT}/${id}`);
  }
}

export default new ConteneureService();
