import axiosInstance from './AxiosConfig';

const ENDPOINT = "/escales";

class EscaleService {
  getAllEscales() {
    return axiosInstance.get(ENDPOINT);
  }

  getEscaleById(id) {
    return axiosInstance.get(`${ENDPOINT}/${id}`);
  }

  createEscale(escale) {
    return axiosInstance.post(ENDPOINT, escale);
  }

  updateEscale(id, escale) {
    return axiosInstance.put(`${ENDPOINT}/${id}`, escale);
  }

  deleteEscale(id) {
    console.log(`Attempting to delete escale with ID: ${id}`);
    return axiosInstance.delete(`${ENDPOINT}/${id}`);
  }
}

export default new EscaleService();
