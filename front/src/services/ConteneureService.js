import axios from "axios";

// Create an axios instance with CORS credentials support
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/conteneurs",
  withCredentials: true,
});

// Add request/response interceptors for debugging
axiosInstance.interceptors.request.use((request) => {
  console.log("Starting Request", request);
  return request;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    console.log("Response Error:", error.response);
    return Promise.reject(error);
  }
);

class ConteneureService {
  getAllConteneures() {
    return axiosInstance.get("");
  }

  getConteneureById(id) {
    return axiosInstance.get(`/${id}`);
  }

  createConteneure(conteneure) {
    return axiosInstance.post("", conteneure);
  }

  updateConteneure(id, conteneure) {
    return axiosInstance.put(`/${id}`, conteneure);
  }

  deleteConteneure(id) {
    return axiosInstance.delete(`/${id}`);
  }
}

export default new ConteneureService();
