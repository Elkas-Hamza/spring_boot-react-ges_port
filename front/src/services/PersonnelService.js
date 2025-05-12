import axiosInstance from "./AxiosConfig";

const ENDPOINT = "/personnel";

class PersonnelService {
  getAllPersonnel() {
    return axiosInstance.get(ENDPOINT);
  }

  getPersonnelById(matricule) {
    return axiosInstance.get(`${ENDPOINT}/${matricule}`);
  }

  getPersonnelByEquipeId(equipeId) {
    return axiosInstance.get(`${ENDPOINT}/equipe/${equipeId}`);
  }

  createPersonnel(data) {
    return axiosInstance.post(ENDPOINT, data);
  }

  updatePersonnel(matricule, data) {
    return axiosInstance.put(`${ENDPOINT}/${matricule}`, data);
  }

  deletePersonnel(matricule) {
    return axiosInstance.delete(`${ENDPOINT}/${matricule}`);
  }
}

const personnelServiceInstance = new PersonnelService();
export default personnelServiceInstance;
