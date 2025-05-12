import axiosInstance from "./AxiosConfig";

const ENDPOINT = "/engins";

class EnginService {
  getAllEngins() {
    return axiosInstance.get(ENDPOINT);
  }

  getEnginById(id) {
    // If id contains commas, it's a multiple request
    if (typeof id === "string" && id.includes(",")) {
      return axiosInstance.get(`${ENDPOINT}/multiple/${id}`);
    }
    return axiosInstance.get(`${ENDPOINT}/${id}`);
  }

  createEngin(data) {
    return axiosInstance.post(ENDPOINT, data);
  }

  updateEngin(id, data) {
    return axiosInstance.put(`${ENDPOINT}/${id}`, data);
  }

  deleteEngin(id) {
    return axiosInstance.delete(`${ENDPOINT}/${id}`);
  }
}

const enginServiceInstance = new EnginService();
export default enginServiceInstance;
