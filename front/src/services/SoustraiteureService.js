import axiosInstance from "./AxiosConfig";

const ENDPOINT = "/soustraiteurs";

class SoustraiteureService {
  getAllSoustraiteure() {
    return axiosInstance.get(ENDPOINT);
  }

  getSoustraiteureById(matricule) {
    return axiosInstance.get(`${ENDPOINT}/${matricule}`);
  }

  getSoustraiteureByEquipeId(equipeId) {
    return axiosInstance.get(`${ENDPOINT}/equipe/${equipeId}`);
  }

  createSoustraiteure(data) {
    return axiosInstance.post(ENDPOINT, data);
  }

  updateSoustraiteure(matricule, data) {
    return axiosInstance.put(`${ENDPOINT}/${matricule}`, data);
  }

  deleteSoustraiteure(matricule) {
    return axiosInstance.delete(`${ENDPOINT}/${matricule}`);
  }
}

const soustraiteureServiceInstance = new SoustraiteureService();
export default soustraiteureServiceInstance;
